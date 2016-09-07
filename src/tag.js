"use strict";

var utils = require('./utils');

var tags = {};

function noop() {}
function noopEmpty(data) { return ""; }
function noopParse(args) { return args; }


class TagObject
{
    constructor(match,template)
    {
        this.tag = match.tag;
        this.template = template;
        this.scope = match.scope;
        this.index = match.index;
        this.text = match.text;
        this.args = match.args;
        this.key = template.tags.length;

        template.tags.push(this);

        this.tag.evaluate.call(this,template);
    }

    replaceWith(what)
    {
        this.template.input = utils.replaceAt(this.template.input, this.index, this.index+this.text.length, what);
    }
}


/**
 * The Tag class.
 * Contains details on how to handle a tag that is encountered in the template.
 * Tags appear as: @mytag() ... @endmytag
 * @author Mike Adamczyk <mike@bom.us>
 */
class Tag
{
    constructor(name,opts)
    {
        this.name = name;
        this.block = opts.block || false;
        this.render = opts.render || noopEmpty;
        this.parse = opts.parse || noopParse;
        this.evaluate = opts.evaluate || noop;
        this.immediate = opts.immediate || false;
    }

    handle(match,template)
    {
        if (match.close) return;

        match.args = this.parse(match.args,template);

        this.evaluate(match,template);
    }

    /**
     * Get a tag object.
     * @param name string
     * @returns {*}
     */
    static get(name)
    {
        return tags[name];
    }

    /**
     * Read a tag match.
     * @param string
     * @param template Template
     * @returns {object}
     */
    static read(string,template,startIndex)
    {
        var close = match[1].substr(0,3) == "end";
        var tagName = close ? match[1].substr(3).trim() : match[2];
        var tag = Tag.get(tagName);
        var args = close ? null : tag.parse(match[3],template);
        var out = {
            close: close,
            tag: tag,
            args: args,
            index: match.index,
            text: match[0],
            context: match.input,
        };
        if (tag.immediate) {
            new Tag.Object(out,template);
        }
        return out;
    }
    /**
     * Find the outer matching tag, to indicate scope.
     * @param tag
     * @param input
     * @param startIndex
     * @returns {number}
     */
    static outer(tag,input,startIndex)
    {
        var open = 1;
        var endtag = "@end"+tag.name;

        for(let i=startIndex+1; i<input.length; i++)
        {
            if (input[i] !== endtag) {
                continue;
            }
            // Did we encounter a closing tag? if true, reduce the open.
            open = matches[i].close === true ? open - 1 : open + 1;

            if (open == 0) {
                match.outer = matches[i];
                matches[i].outer = match;
                var scope = match.context.slice(match.index+match.text.length, match.outer.index).trim();
                match.scope = scope;
                matches[i].scope = scope;
                return matches[i];
            }
        }
    }

    /**
     * Create a tag object.
     * @param name
     * @param opts
     * @returns {Tag}
     */
    static extend(name,opts)
    {
        return tags[name] = new Tag(name,opts);
    }

    static get Object()
    {
        return TagObject;
    }
}

module.exports = Tag;