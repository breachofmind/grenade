"use strict";

const MODE_RAW = "=";
const MODE_COMMENT = "#";

var find = require('./utils').matches;
var Filter = require('./filter');

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
        this.filters = this.getFilters();

        this.source = this.getSource();
    }

    /**
     * Get the filters for this variable.
     * @returns {Array}
     */
    getFilters()
    {
        var filters = [];

        // Parse the incoming variable text.
        if (this.text.indexOf(" | ") > -1) {
            var parts = this.text.split("|",2);
            filters = parts[1].split(",");
            this.text = parts[0].trim();
        }

        var prefix = this.text[0];
        if (prefix == MODE_RAW) {
            this.text = this.text.slice(1).trim();
            return filters;
        }
        // There can be custom prefixes.
        var filter = Filter.prefixes[prefix];
        if (filter) {
            if (filter.pushPrefix) {
                filters.push(filter.name);
            } else {
                filters.unshift(filter.name);
            }
            this.text = this.text.slice(1).trim();
            if (filter.transform) {
                this.text = filter.transform(this.text);
            }
        } else {
            // By default, all values are escaped.
            filters.push('escape');
        }
        return filters;
    }

    /**
     * Get the source javascript for compiling.
     * @returns {string}
     */
    getSource()
    {
        var src = `__out += ${this.text};`;

        if (this.filters.length) {
            var filters = JSON.stringify(this.filters);
            src = `__out += __val(${this.text},${this.template.compiler.localsName},${filters});`;
        }
        return src;
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
        var endIndex = find(template.compiler.delimiter, input, function(match,start)
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