"use strict";

var grenade         = require('grenade');
var utils           = require('./utils');
var append          = utils.append;
var find            = utils.matches;
var CompileError    = utils.CompileError;

const TAG_RX = /\@((\w+)\((.*)\)|(\w+))/gm;


/**
 * A tag in a template.
 * @constructor
 */
class TemplateTag
{
    constructor(match,template)
    {
        this.key        = null;
        this.index      = null;
        this.text       = match.text;
        this.type       = match.tag.name;
        this.evaluated  = false;
        this.template   = template;
        this.tag        = match.tag;
        this.start      = match.start;
        this.end        = match.end;
        this.source     = null;
        this.args       = null;
        this.scope      = null;

        if (this.tag.block) {
            this.scope = new grenade.Template(match.scope, template, this);
        }

        if (this.tag.hasArguments) {
            this.args = this.tag.parse.call(this, match.args, template);
        }
    }

    /**
     * Set the source code.
     * @param source string
     * @returns {*}
     */
    setSource(source)
    {
        return this.source = source;
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

            // Use the default source for rendering.
            if (! this.source && this.tag.render) {
                var passArgs = this.tag.passArguments ? `,${this.args}` : ",null";
                this.setSource(append(`__t["${this.key}"].render(${this.template.compiler.localsName}${passArgs})`));
            }
        }
    }

    /**
     * Call the tag render method.
     * @param data object
     * @param args mixed
     * @returns {string}
     */
    render(data,args)
    {
        if (! this.tag.render) {
            throw (`Tag @${this.type} does not have a render() method`);
        }
        return this.tag.render.call(this,data,args,this.template);
    }

    /**
     * Store this tag in the tag index.
     * It's rendering function can be used later in the source.
     * @return string
     */
    store()
    {
        var root = this.template.root;
        var len = Object.keys(root._tagIndex).length;
        this.key = `\$${this.template.id}\$${len}`;
        root._tagIndex[this.key] = this;

        return this.key;
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
            var object = grenade.Tag.get(tag);
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