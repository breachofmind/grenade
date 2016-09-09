"use strict";

var Tag = require('./tag');

/**
 * A tag was matched in the template.
 */
class MatchTag
{
    /**
     * Create a new tag match.
     * @param match array from rx.exec()
     * @param template Template
     */
    constructor(match,template)
    {
        this.key = null;
        this.index = null;

        this.tag = Tag.get(match[2]);
        this.name = this.tag.name;
        this.template = template;
        this.scope = null;
        this.evaluated = false;

        this.args = this.parse(match[3]);
        this.source = "";
    }

    /**
     * Parse the tag arguments.
     * @param args string
     * @returns {*|{key, array, index}|number}
     */
    parse(args)
    {
        return this.tag.parse.call(this,args);
    }

    /**
     * Evaluate the tag.
     * @returns {*|Object}
     */
    evaluate()
    {
        if (! this.evaluated) {
            this.evaluated = true;
            this.template.compiler.log("Evaluating tag: %s [%s]",this.name,this.template.level);

            return this.tag.evaluate.call(this);
        }
    }

    /**
     * Render this object with data.
     * @param data object
     * @returns {*}
     */
    render(data)
    {
        return this.tag.render.call(this,data);
    }

    /**
     * Add this tag to the output and index the object.
     * @returns void
     */
    add()
    {
        this.index = this.template.output.length;
        this.template.output.push(this);

        this.key = this.template.compiler.tags.length;
        this.template.compiler.tags.push(this);

        this.source = `this.tag(data,${this.key})`;
    }

    /**
     * Replace the output at this tag's position with this object.
     * @param what
     * @returns {*}
     */
    replaceWith(what)
    {
        return this.template.output[this.index] = what;
    }

    /**
     * Erase this tag from the output.
     * @returns null
     */
    erase()
    {
        this.replaceWith(null);
    }

    /**
     * Convert this tag to a string.
     * @returns {string|*}
     */
    toString()
    {
        return this.source;
    }
}

module.exports = MatchTag;