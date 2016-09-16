"use strict";

var utils = require('./utils');
var find = utils.matches;
var CompileError = utils.CompileError;
var Tag = require('./tag');

const TAG_RX = /\@((\w+)\((.*)\)|(\w+))/gm;


/**
 * A tag in a template.
 * @constructor
 */
class TemplateTag
{
    constructor(match,template)
    {
        var Template = require('./template');

        this.index = null;
        this.type = match.tag.name;
        this.evaluated = false;
        this.template = template;
        this.tag = match.tag;
        this.start = match.start;
        this.end = match.end;

        this.args = null;

        if (this.tag.hasArguments) {
            this.args = this.tag.parse.call(this, match.args, template);
        }

        this.scope = this.tag.block ? new Template(match.scope, template, this) : null;
    }

    /**
     * Evaluate a tag after it has been collected and parsed.
     * @returns void
     */
    evaluate()
    {
        if (! this.evaluated) {
            this.evaluated = true;
            this.tag.evaluate.call(this, this.template);
        }
    }

    /**
     * Replace the tag in the output with the given.
     * @param what string|TemplateTag|TemplateVar|Template
     * @returns {TemplateTag}
     */
    replaceWith(what)
    {
        this.template.output[this.index] = what;
        return this;
    }

    /**
     * Flatten the object (for debugging)
     * @returns {{tag: *, scope: *}}
     */
    flatten()
    {
        return {tag:this.type, scope: this.scope? this.scope.flatten() : null};
    }

    /**
     * Parse the input and return the matched tags.
     * @param template Template
     * @param input string
     * @returns {Array}
     */
    static parser(template,input)
    {
        var indexes = [];

        if (! input) {
            return indexes;
        }

        // Get the tag indexes.
        find(TAG_RX, input, function(match)
        {
            var line = match[0];
            var closing = line.substr(0,4) == "@end";
            var args = closing ? null : match[3];
            var tag = closing ? match[1].slice(3) : (! match[2] ? match[1] : match[2]);
            var object = Tag.get(tag);
            if (object) {
                indexes.push({
                    input: input,
                    start: match.index,
                    text: line,
                    end: match.index + line.length,
                    tag: object,
                    closing: closing,
                    args: args,
                    scope: object.block && !closing ? true : null
                });
            }
        });

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

            matches.push( new TemplateTag(match,template) );
        }

        return matches;
    }
}

module.exports = TemplateTag;