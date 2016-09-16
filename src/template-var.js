"use strict";

const VAR_RX = /\$\{(.*?)\}/gm;

var find = require('./utils').matches;


/**
 * A variable in a template.
 * @constructor
 */
class TemplateVar
{
    constructor(text,template)
    {
        this.text = text;
        this.template = template;
        this.filters = [];

        if (text.indexOf("|") > -1) {
            var parts = this.text.split("|",2);
            this.filters = parts[1].split(",");
            this.text = parts[0].trim();
        }

        if (! this.text.startsWith("=")) {
            this.filters.push('escape');
        } else {
            this.text = this.text.slice(1);
        }

        var filters = JSON.stringify(this.filters);
        this.source = `__out.push(__v(${this.text},__data,${filters}));`;
    }

    flatten()
    {
        return this.text;
    }

    /**
     * Parse an input string into strings and variable objects.
     * @param template Template
     * @param input string
     * @returns {Array}
     */
    static parser(template,input)
    {
        var output = [];

        if (!input) {
            return output;
        }
        var endIndex = find(VAR_RX, input, function(match,start)
        {
            output.push(input.slice(start,match.index));

            // This is a comment.
            if (match[1][0] == "#") {
                return;
            }
            output.push(new TemplateVar(match[1],template));
        });

        var end = input.slice(endIndex);
        if (end!=="") {
            output.push(end);
        }

        return output;
    }

}

module.exports = TemplateVar;