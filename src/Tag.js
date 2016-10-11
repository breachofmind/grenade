"use strict";

/**
 * The tag class.
 */
class Tag
{
    constructor(name, opts)
    {
        this.name = name;
        this.block = opts.block || false;
        this.isolate = opts.isolate || false;
        this.hasArguments = opts.hasArguments || true;
        this.passArguments = opts.passArguments || false;

        /**
         * Parses the arguments of a tag.
         * @param args string
         * @returns {*}
         */
        this.parse = opts.parse || function(args) { return args; };

        /**
         * Evaluates the tag after the template has been compiled.
         * @returns {*}
         */
        this.evaluate = opts.evaluate || function() { return null; };

        /**
         * Renders the tag with data.
         * @param data object
         * @returns {string}
         */
        this.render = opts.render || null;
    }
}

/**
 * Factory for creating tags.
 */
class TagFactory
{
    constructor()
    {
        this.tags = {};
    }

    /**
     * Get a defined tag.
     * @param name string
     * @returns {*|null}
     */
    get(name)
    {
        return this.tags[name] || null;
    }

    /**
     * Create a new tag.
     * @param name string
     * @param opts object
     * @returns {Tag}
     */
    extend(name,opts)
    {
        var tag = new Tag(name,opts);

        return this.tags[name] = tag;
    }
}


module.exports = new TagFactory;