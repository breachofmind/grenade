"use strict";

var _     = require('lodash');
var fs    = require('fs');
var path  = require('path');
var utils = require('./utils');
var Promise = require('bluebird');
var Tag   = require('./tag');
var beautify = require('js-beautify').html;


/**
 * The Template class.
 * @param input string
 * @param parent Template
 * @constructor
 */
function Template(input,parent)
{
    this.input = input;
    this.parent = parent || null;
    this.matches = {};

    this.getTagMatches(Tag.getConstructors());

    this.createAccessors();
}


Template.prototype = {

    /**
     * Return the root matching tag.
     * @returns {Template}
     */
    root: function()
    {
        var parent = this;
        while (parent.parent) {parent = parent.parent;}
        return parent;
    },

    /**
     * Return the depth.
     * @returns {number}
     */
    level: function()
    {
        var parent = this, level=1;
        while(parent.parent) {parent = parent.parent; level++;}
        return level;
    },

    /**
     * Return a list of all tag matches.
     * @param tags array
     * @returns {Array|*}
     */
    getTagMatches: function(tags)
    {
        for (let i=0; i<tags.length; i++) {
            Tag.getObject(tags[i]).find(this);
        }

        return this.matches;
    },

    /**
     * Creates accessor functions for ${variable} data.
     * This is evaluated when the template is rendered later.
     * @returns number
     */
    createAccessors: function()
    {
        var matches = utils.matches(/\$\{(.*?)\}/gm, this.input);
        for (let i=0; i<matches.length; i++) {
            var match = matches[i];
            if (! _.startsWith(match[1],'data.tag')) {
                this.replace(match[0], '${data.prop("' + _.escape(match[1])+'",this)}');
            }
        }
        return matches.length;
    },

    /**
     * Replaces a part of the template input.
     * @param str string
     * @param withWhat string to replace with
     * @returns {Template}
     */
    replace: function(str, withWhat) {
        this.input = _.replace(this.input, str, withWhat);
        return this;
    },

    /**
     * Erases the given string in the template.
     * @param str string
     * @returns {Template}
     */
    erase: function(str) {
        return this.replace(str,"");
    },

    /**
     * Render the template.
     * @param data object
     * @returns {string}
     */
    render: function(data)
    {
        // Split into the strings and functions
        var parts = this.input.split(/\$(\{.*?\})/gm);
        var output = parts.map(function(part) {
            if (_.startsWith(part,"{") && _.endsWith(part,"}")) {
                var func = part.replace(/[\{}]/g,"");
                return eval("try { "+func+" } catch (e) { e; }");
            }
            return part;
        }.bind(this));


        return beautify(output.join(""), {indent_size:2}).trim();
    }
};

module.exports = Template;