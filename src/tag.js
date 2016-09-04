"use strict";

var utils = require('./utils');

function noop(args) {
    return function() {
        return args;
    }
}

function Tag(name,opts)
{
    if (!opts) opts = {};

    this.name = name;
    this.block = opts.block || false;
    this.greedy = opts.greedy || false;
    this.parse = opts.parse || null;
    this.evaluate = opts.evaluate || noop(null);
    this.render = opts.render || noop("");

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
        return utils.matches(this.rx, template.input).map(function(match){
            return new TagMatch(match, template);
        });
    }
};

Tag.objects = {};

/**
 * Create a new tag.
 * @param name string
 * @param opts options
 * @returns {Tag}
 */
Tag.extend = function(name,opts)
{
    var tag = new Tag(name,opts);
    Tag.objects[name] = tag;
    return tag;
};

/**
 * Returns a template tag string.
 * @param match TagMatch
 * @returns {string}
 */
Tag.renderer = function(match)
{
    return '${data.tag("'+match.key+'",this)}';
};


/**
 * A matching tag in the document.
 * @param match array
 * @param template Template
 * @constructor
 */
function TagMatch(match, template)
{
    this.template   = template;
    this.input      = match[0];
    this.tag        = Tag.objects[match[1]];
    this.key        = this.tag.name+template.level()+Object.keys(template.matches).length;
    this.args       = this.tag.parse ? this.tag.parse(match[2]) : match[2];
    this.scope      = match[3] || null;

    if (! this.tag) {
        throw new Error('Tag object was not found: '+match[1])
    }

    template.matches[this.key] = this;

    // Evaluating the tag can effect the template input string.
    this.tag.evaluate(template,this);
}


module.exports = Tag;