"use strict";

var Promise = require('bluebird');
var Tag = require('./tag');
var TemplateTag = require('./template-tag');
var TemplateVar = require('./template-var');
var Filter = require('./filter');

class Template
{
    constructor(input, parent, compiler)
    {
        this.input = input;
        this.output = [];
        this.parent = parent || null;
        this.compiler = compiler || this.parent.compiler;

        this.tags = TemplateTag.parser(this, input);

        // Split the input into an output array.
        this.walk();

        this.source = this.getSource();

        // The compiled source function.
        if (! this.parent)
        {
            this.fn = new Function('__data,__v,__out', `
                with(__data) {
                    try {
                        ${this.source}
                    } catch(e) {
                        return e;
                    }

                    return __out.join("").trim();
                }
        `);
        }

    }


    /**
     * Walk the input and found tags and variables
     * and create the output array.
     * @returns {*[]}
     */
    walk()
    {
        if (! this.tags.length) {
           return this.search(this.input);
        }
        var index = 0;
        for (var i=0; i<this.tags.length; i++)
        {
            var tag = this.tags[i];

            // Piece before
            var before = this.input.slice(index, tag.start);
            if (before !== "") {
                // Search for variables and add to output.
                this.search(before);
            }
            this.output.push(tag);

            tag.index = this.output.indexOf(tag);
            tag.evaluate();

            index = tag.end;
        }

        // Push the end
        var end = this.input.slice(index);
        if (end !== "") {
            this.search(end);
        }
    }

    /**
     * Search a string for variable references.
     * @param string
     */
    search(string)
    {
        var out = TemplateVar.parser(this,string);

        this.output = this.output.concat(out);
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
        var source = [];
        for (var i=0; i<this.output.length; i++) {
            if (typeof this.output[i] == "string") {
                source.push("__out.push("+ JSON.stringify(this.output[i]) + ");");
                continue;
            }
            source.push(this.output[i].source);
        }
        return source.join("\n");
    }

    /**
     * Render the compiled javascript.
     * @param data object
     * @returns {*}
     */
    render(data)
    {
        return this.fn(data, Filter.func(), []);
    }
}

module.exports = Template;


