"use strict";

var utils = require('./utils');
var Template = require('./template');

var tags = {};

/**
 * The Tag class.
 * Contains details on how to handle a tag that is encountered in the template.
 * Tags appear as: @mytag() ... @endmytag
 * @author Mike Adamczyk <mike@bom.us>
 */
class BaseTag
{
    constructor(name,opts)
    {
        this.name = name;
        this.block = opts.block || false;
    }

    parse(args,template)
    {
        return eval(args);
    }

    evaluate(match,template)
    {
        return null;
    }

    render(data,match,template)
    {
        return "";
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
     * Create a tag object.
     * @param name
     * @param opts
     * @returns {Tag}
     */
    static extend(name,opts)
    {
        class Tag extends BaseTag
        {
            constructor(name,opts)
            {
                super(name,opts);
            }
        }
        ['parse','evaluate','render'].map(function(func) {
            if (opts[func]) {
                Tag.prototype[func] = opts[func];
            }
        });

        return tags[name] = new Tag(name,opts);
    }
}

module.exports = BaseTag;