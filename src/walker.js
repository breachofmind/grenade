"use strict";

var TagObject = require('./match');
var utils = require('./utils');

class Walker
{
    constructor(template)
    {
        this.template = template;
    }

    append(output)
    {
        this.template.output.push(output);
    }

    line(i)
    {
        return this.template.input[i];
    }
    /**
     * Find vars in the given line.
     * @param i
     * @returns {*}
     */
    vars(i)
    {
        var line = this.line(i);

        if (! utils.RX_VAR.test(line)) {
            return this.append(line);
        }
        var input = line.split(utils.RX_VARS);
        var output = [];
        for (var i=0; i<input.length; i++) {
            var segment = input[i];
            if (! segment || ! segment.length) {
                continue;
            }
            if (segment.substr(0,2) !== "${") {
                this.append(segment);
                continue;
            }
            var args = utils.parseVar(segment.trim());
            if (args.mode == "#") continue;

            args.index = this.template.compiler.vars.length;
            this.template.compiler.vars.push(args);
            this.append(args);
        }

        return output;
    }

    /**
     * Find a tag match or append the output string.
     * @param i number
     * @returns {*}
     */
    match(i)
    {
        var line = this.line(i);

        // Not a valid line, or empty string.
        if (! line || !line.length) {
            return;
        }
        // This is not a template tag, just a string.
        // Add to the output.
        if (line[0] !== "@") {
            this.vars(i);
            return;
        }
        // We might be dealing with a template tag.
        // Is it an opening tag?
        var tagName = line.substr(1,line.indexOf('(')-1);
        if (! tagName) {
            this.append(line); // Could be @else statement.
            return;
        }

        // Only return the opening tag, which contains the args.
        return new TagObject(utils.RX_TAG.exec(line), this.template);
    }

    /**
     * Given a TagObject and index, set the tag's block scope.
     * @param match TagObject
     * @param i number index
     * @returns {*}
     */
    scope(match,i)
    {
        var Template = this.template.constructor;

        var scope = [],
            endtag = "@end"+match.name;

        for (var n=i + 1, open = 1; n<this.template.input.length; n++)
        {
            var line = this.line(n);

            // Not a string or empty string.
            if (!line || !line.length) {
                continue;
            }
            // Does the match equal @tagname or @endtagname?
            // We need to find the outer ending tag,
            // So check the level depth.
            if (line.substr(0,match.name.length+1) == "@"+match.name) {
                open ++;
            } else if(line == endtag) {
                open --;
            }

            if (open == 0) {
                match.add();
                match.scope = new Template(scope,this.template);
                return n; // skip ahead.

            } else {
                scope.push(line);
            }
        }
    }

    /**
     * Walk the template input array.
     * @returns {Array}
     */
    walk()
    {
        for(var i=0; i<this.template.input.length; i++)
        {
            var match = this.match(i);

            if (! match) continue;

            // This is not a tag block.
            // Add it to the template output.
            if (! match.tag.block) {
                match.add();
                continue;
            }

            // This is a tag block.
            // Find the scope and advance the pointer.
            i = this.scope(match,i);
        }

        return this.template.output;
    }
}

module.exports = Walker;