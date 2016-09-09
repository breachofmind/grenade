"use strict";

var TagObject = require('./match');
var utils = require('./utils');

const RX_VARS = /(\$\{.*?\})/gm;
const RX_VAR = /\$\{(.*?)\}/;
const RX_TAG = /\@((\w+)\((.*)\)|(\w+))/;

function walk(template)
{
    var compiler = template.compiler;

    /**
     * Walk the template input array.
     * @returns {Array}
     */
    for(let i = 0; i < template.input.length; i++)
    {
        var match = tag(i);

        if (! match) continue;

        // This is not a tag block.
        // Add it to the template output.
        if (! match.tag.block) {
            match.add();
            continue;
        }

        // This is a tag block.
        // Find the scope and advance the pointer.
        i = scope(match,i);
    }

    template.output.map(function(object) {
        if (object instanceof TagObject) object.evaluate();
    });


    function append(output) {
        template.output.push(output);
    }

    /**
     * For a given line, discover any variables.
     * @param index number
     * @returns {*}
     */
    function vars(index)
    {
        var line = template.input[index];

        // If there are no vars on this line, skip it.
        if (! RX_VAR.test(line)) {
            return append(line);
        }
        var input = line.split(RX_VARS);
        var output = [];

        for (var i=0; i<input.length; i++)
        {
            var segment = input[i];
            if (! segment || ! segment.length) {
                continue;
            }
            // This is a string, not a variable.
            if (segment.substr(0,2) !== "${") {
                append(segment);
                continue;
            }
            // This is a comment.
            if (segment.substr(0,3) == "${#") {
                continue;
            }

            // This is a variable.
            var args = utils.parseVar(segment.trim());
            args.index = compiler.vars.length;
            compiler.vars.push(args);
            append(args);
        }
    }

    /**
     * Find a tag match or append the output string.
     * @param index number
     * @returns {*}
     */
    function tag(index)
    {
        var line = template.input[index];

        // Not a valid line, or empty string.
        if (! line || !line.length) {
            return;
        }
        // This is not a template tag, just a string.
        // Add to the output.
        if (line[0] !== "@") {
            vars(index);
            return;
        }
        // We might be dealing with a template tag.
        // Is it an opening tag?
        var tagName = line.substr(1,line.indexOf('(')-1);
        if (! tagName) {
            append(line); // Could be @else statement.
            return;
        }

        // Only return the opening tag, which contains the args.
        return new TagObject(RX_TAG.exec(line), template);
    }


    /**
     * Given a TagObject and index, set the tag's block scope.
     * @param match TagObject
     * @param index number
     * @returns {*}
     */
    function scope(match,index)
    {
        var Template = template.constructor;

        var scope = [],
            endtag = "@end"+match.name;

        for (var i = index + 1, open = 1; i < template.input.length; i++)
        {
            var line = template.input[i];

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
                match.scope = new Template(scope,template);
                return i; // skip ahead.

            } else {
                scope.push(line);
            }
        }
    }
}


module.exports = walk;