"use strict";

var utils       = require('./support/utils');
var Tag         = require('./Tag');
var TemplateTag = require('./TemplateTag');
var TemplateVar = require('./TemplateVar');
var Filter      = require('./Filter');
var Parser      = require('./Parser');
var rethrow     = utils.rethrow;
var append      = utils.append;
var Promise     = require('bluebird');

class Template {
    /**
     * Template constructor.
     * @param input string
     * @param parent Template
     * @param scope Compiler|Template|TemplateTag (Compiler if root template)
     */
    constructor(input, parent, scope)
    {
        this.input = input;
        this.parent = parent || null;
        this.compiler = this.isRoot ? scope : this.parent.compiler;
        this.scope = this.isRoot ? null : scope;
        this.parser = new Parser(this);

        if (this.isRoot) {
            this._tagIndex = {};
            this._n = 0;
        }

        this.id = this.isRoot ? 0 : this.root._n++;
        this.tags = this.parser.parseTags(this.input);
        this.output = this.setOutput();
        this.source = this.getSource();

        // The compiled source function.
        if (this.isRoot) this.fn = new Function(`${this.compiler.localsName}, __out, $$`, this.source);
    }

    /**
     * Get the root template.
     * @returns {*}
     */
    get root()
    {
        if (this.isRoot) return this;

        var parent = this.parent;
        while (!parent.isRoot) {
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

        if (!this.tags.length) {
            return this.output = this.output.concat(this.parser.parseVars(this.input));
        }

        var index = 0;
        this.tags.forEach((tag) =>
        {
            // Piece before
            var before = this.input.slice(index, tag.start);
            if (before !== "") {
                // Search for variables and add to output.
                this.output = this.output.concat(this.parser.parseVars(before));
            }
            this.output.push(tag);

            tag.index = this.output.indexOf(tag);
            tag.store();
            tag.evaluate();

            index = tag.end;

        });

        // Push the end
        var end = this.input.slice(index);
        if (end !== "") {
            this.output = this.output.concat(this.parser.parseVars(end));
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
        this.output.forEach(function (output)
        {
            if (!output || output == "") {
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
        var outsrc = [],
            source;

        for (let i = 0, len = this.output.length; i < len; i++) {
            var line = this.output[i];

            // Combine lines of strings into a single index.
            if (typeof line == "string") {
                var concat = line;
                while (typeof this.output[i + 1] == "string") {
                    i++;
                    concat += this.output[i];
                }
                outsrc.push(append(JSON.stringify(concat)));
                continue;
            }
            outsrc.push(line.source);
        }

        source = outsrc.join("\n");

        if (this.isRoot) source = this._getSourceOption(source);

        return source;
    }

    /**
     * Return the string source based on promise or non-promise output.
     * @param source string
     * @returns {string}
     * @private
     */
    _getSourceOption(source)
    {
        var out = "__out.join('').trim('')";

        // Promise-based output.
        if (this.compiler.promises) {
            return `
            ${source}
            return $$.q.all(__out, function(result) { return result; })
                .error(function(e) { return $$.rethrow(e, ${out}); })
                .then(function(__out) { return ${out} });
            `;
        }
        // Non-promise output.
        return `
        try {
            ${source}
            return ${out};
        } catch(e) { 
            return $$.rethrow(e,${out}) 
        }
        
        `;
    }
    

    /**
     * Render the compiled javascript.
     * @param data object
     * @returns {*}
     */
    render(data)
    {
        return this.fn(data, [], {
            rethrow: rethrow,
            tag:     this._tagIndex,
            val:     Filter.functions(),
            q:       Promise,
        });
    }
}

module.exports = Template;


