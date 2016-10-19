"use strict";

var TemplateVar     = require('./TemplateVar');
var TemplateTag     = require('./TemplateTag');
var utils           = require('./support/utils');
var grenade         = require('grenade');
var find            = utils.matches;
var CompileError    = utils.CompileError;


class Parser
{
    constructor(template)
    {
        this.template = template;
        this.delimiter = template.compiler.delimiter;
    }

    /**
     * Parse the given input string for variables.
     * @param input string
     * @returns {Array}
     */
    parseVars(input)
    {
        var template = this.template,
            output = [];

        if (!input) {
            return output;
        }
        var endIndex = find(this.delimiter, input, (match,start)=>
        {
            // Add everything before this starting index.
            output.push(input.slice(start,match.index));

            // Check for comments or literals.
            if (match[1].startsWith(TemplateVar.MODE_COMMENT)) {
                return;
            } else if(match[1].startsWith(TemplateVar.MODE_LITERAL)) {
                return output.push(match[0].replace(TemplateVar.MODE_LITERAL,""));
            }
            output.push(new TemplateVar(match[1], this.template));
        });

        // Add everything after the last ending index.
        var end = input.slice(endIndex);

        if (end!=="") output.push(end);

        return output;
    }


    /**
     * Parse the given input for tags.
     * @param input string
     * @returns {Array}
     */
    parseTags(input)
    {
        var indexes = [];

        if (! input) {
            return indexes;
        }

        // Get the tag indexes.
        find(TemplateTag.REGEX, input, (match)=>
        {
            var line = match[0];
            var closing = line.substr(0,4) == "@end";
            var args = closing ? null : match[3];
            var tag = closing ? match[1].slice(3) : (! match[2] ? match[1] : match[2]);
            var object = grenade.Tag.get(tag);

            if (object) {
                indexes.push({
                    input:   input,
                    start:   match.index,
                    text:    line,
                    end:     match.index + line.length,
                    tag:     object,
                    closing: closing,
                    args:    args,
                    scope:   object.block && !closing ? true : null
                });
            }
        });

        return this.getTagScopes(indexes, input);
    }

    /**
     * Get the scopes for the given found tag indexes.
     * @param indexes array
     * @param input string
     * @returns {Array}
     */
    getTagScopes(indexes, input)
    {
        // Get the scopes.
        for(var i=0, matches=[]; i<indexes.length; i++)
        {
            var match = indexes[i];
            var open = 0;
            if (match.closing) {
                continue;
            }

            if (match.tag.block)
            {
                open++;
                for (var n = i+1; n<indexes.length; n++)
                {
                    var next = indexes[n];
                    if (next.tag.name !== match.tag.name) {
                        continue;
                    }

                    open = next.closing ? open - 1 : open + 1;

                    if (open == 0) {
                        match.scope = input.slice(match.start + match.text.length, next.end - next.text.length);
                        match.end = match.start + match.text.length + match.scope.length + next.text.length;

                        // Skip ahead.
                        i=n;
                        break;
                    }
                }
                // If open is not 0, a tag was not closed.
                if (open !== 0) {
                    throw new CompileError ("A tag was not closed", match);
                }
            }

            matches.push( new TemplateTag(match, this.template) );
        }

        return matches;
    }
}

module.exports = Parser;