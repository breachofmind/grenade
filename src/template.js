"use strict";

var utils = require('./utils');
var Tag = require('./tag');
var TemplateTag = require('./template-tag');
var TemplateVar = require('./template-var');
var Filter = require('./filter');
var rethrow = utils.rethrow;
var append = utils.append;

class Template
{
    /**
     * Template constructor.
     * @param input string
     * @param parent Template
     * @param scope Compiler|Template|TemplateTag (Compiler if root template)
     */
    constructor(input, parent, scope)
    {
        this.input      = input;
        this.parent     = parent || null;
        this.compiler   = this.isRoot ? scope : this.parent.compiler;
        this.scope      = this.isRoot ? null  : scope;

        if (this.isRoot) {
            this._tagIndex = {};
            this._n = 0;
        }

        this.id         = this.isRoot ? 0 : this.root._n ++;
        this.tags       = TemplateTag.parser(this, input);
        this.output     = this.setOutput();
        this.source     = this.getSource();

        // The compiled source function.
        if (this.isRoot)
        {
            this.fn = new Function(`${this.compiler.localsName},__val,__tag,rethrow,__out`, `
                try {
                    ${this.source}
                } catch(e) {
                    return rethrow(e,__out);
                }

                return __out.trim();
        `);
        }

    }

    /**
     * Get the root template.
     * @returns {*}
     */
    get root()
    {
        if (this.isRoot) return this;

        var parent = this.parent;
        while (! parent.isRoot) {
            parent = parent.parent;
        }
        return parent;
    }

    /**
     * Check if this template is root.
     * @returns {boolean}
     */
    get isRoot()
    {
        return this.parent ? false : true;
    }

    /**
     * Walk the input of found tags and variables
     * and create the output array.
     * @returns {*[]}
     */
    setOutput()
    {
        this.output = [];

        if (! this.tags.length) {
           return this.output = this.output.concat(TemplateVar.parser(this,this.input));
        }

        var index = 0;
        this.tags.forEach(function(tag)
        {
            // Piece before
            var before = this.input.slice(index, tag.start);
            if (before !== "") {
                // Search for variables and add to output.
                this.output = this.output.concat(TemplateVar.parser(this,before));
            }
            this.output.push(tag);

            tag.index = this.output.indexOf(tag);
            tag.store();
            tag.evaluate();

            index = tag.end;

        }.bind(this));

        // Push the end
        var end = this.input.slice(index);
        if (end !== "") {
            this.output = this.output.concat(TemplateVar.parser(this,end));
        }

        return this.output;
    }

    /**
     * Flattens the output array.
     * Used for debugging.
     * @returns {Array}
     */
    flatten()
    {
        var out = [];
        this.output.forEach(function(output) {
            if (! output || output == "") {
                return;
            }
            if (output instanceof TemplateTag || output instanceof Template || output instanceof TemplateVar) {
                out = out.concat(output.flatten());
            } else {
                out.push(output);
            }
        });
        return out;
    }

    /**
     * Get the source javascript for compilation.
     * @returns {string}
     */
    getSource()
    {
        return this.output.map(function(line)
        {
            if (typeof line == "string") {
                return append(JSON.stringify(line));
            }
            return line.source;

        }).join("\n");
    }

    /**
     * Render the compiled javascript.
     * @param data object
     * @returns {*}
     */
    render(data)
    {
        return this.fn(data, Filter.functions(), this._tagIndex, rethrow, "");
    }
}

module.exports = Template;


