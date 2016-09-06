"use strict";

var utils = require('./utils');

var objects = {};
var constructors = [];
var counter = 0;

function noop(args) {
    return function() {
        return args;
    }
}

/**
 * The Tag class.
 * @param name string
 * @param opts options
 * @constructor
 */
function Tag(name,opts)
{
    if (!opts) opts = {};

    this.name = name;
    this.block = opts.block || false;
    this.greedy = opts.greedy || false;
    this.parse = opts.parse || null;
    this.evaluate = opts.evaluate || noop(null);
    this.render = opts.render || noop("");

    if (! opts.hasOwnProperty('construct') || opts.construct == true) {
        Tag.addConstructor(this);
    }

    this.rx = this.getRx();
}

Tag.prototype = {

    /**
     * Get the appropriate regex expression given the tag options.
     * @returns {RegExp}
     */
    getRx: function()
    {
        var rxstr = `\\s*\\@(${this.name})\\((.*?)\\)\\s*$`;
        if (this.block) {
            var endtag = "end"+this.name;
            rxstr += `([\\s\\S]+`;
            if (this.greedy) rxstr += "?";
            rxstr += `)\\@(${endtag})\\s*$`;
        }
        return new RegExp(rxstr,'gm');
    },

    /**
     * Find the tags in the given template.
     * Returns TagMatch objects.
     * @param template
     * @returns {Array}
     */
    find: function(template)
    {
        utils.eachMatch(this.rx, template, function(match) {
            return new TagMatch(match, template);
        });
    }
};

/**
 * Get a tag object.
 * @param name string
 * @returns {*}
 */
Tag.getObject = function(name)
{
    return objects[name];
};

/**
 * Add a tag to the constructor.
 * Whenever a new template is created, a tag is searched for in the queue.
 * @param tag string
 * @returns {*}
 */
Tag.addConstructor = function(tag)
{
    return constructors.indexOf(tag.name) == -1 ? constructors.push(tag.name) : null;
};

/**
 * Get the tag constructors.
 * @returns {Array}
 */
Tag.getConstructors = function()
{
    return constructors;
};

/**
 * Create a new tag.
 * @param name string
 * @param opts options
 * @returns {Tag}
 */
Tag.extend = function(name,opts)
{
    var tag = new Tag(name,opts);
    objects[name] = tag;
    return tag;
};

/**
 * Returns a template tag string.
 * @param match TagMatch
 * @returns {string}
 */
Tag.renderer = function(match)
{
    return '${__data.tag("'+match.key+'",this)}';
};


/**
 * A matching tag in the document.
 * @param match array
 * @param template Template
 * @constructor
 */
function TagMatch(match, template)
{
    counter++;

    this.indexes    = [match.index,match.lastIndex];
    this.template   = template;
    this.input      = match[0];
    this.tag        = Tag.getObject(match[1]);
    this.key        = this.tag.name+counter;
    this.args       = this.tag.parse ? this.tag.parse(match[2]) : match[2];
    this.scope      = match[3] || null;

    if (! this.tag) {
        throw new Error('Tag object was not found: '+match[1])
    }

    template.matches[this.key] = this;

    // Evaluating the tag can effect the template input string.
    this.tag.evaluate(template,this);


}

/**
 * Replace the matched input with the given string.
 * @example @section("content") ... @endsection -> ""
 * @param withWhat string
 * @returns {*}
 */
TagMatch.prototype.replace = function(withWhat)
{
    return this.template.input = utils.replaceAt(this.template.input, this.indexes[0], this.indexes[0]+this.input.length, withWhat);
};


module.exports = Tag;