"use strict";

var _     = require('lodash');
var fs    = require('fs');
var path  = require('path');
var utils = require('./utils');
var Promise = require('bluebird');
var Tag   = require('./tag');
var beautify = require('js-beautify').html;

const VAR_RX = /\$\{(.*?)\}/gm;
const DEBUG = false;

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

    this.source = this.generateSource();
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
     * @returns object
     */
    generateSource: function()
    {
        var source = this.input;

        var matches = utils.matches(VAR_RX, source);

        for (let i=0; i<matches.length; i++)
        {
            var match = matches[i];
            var string = match[1];
            if (! _.startsWith(string,'data.tag')) {
                var args = "";
                if (string[0] == "=" || string[0] == "#") {
                    args = '"'+ _.escape(string.replace(string[0],""))+'"';
                    args += ',"'+string[0]+'"';
                } else {
                    args = '"'+ _.escape(string)+'"';
                }

                var func = 'data.prop('+args+')';
                match[1] = '${'+func+'}';
                source = source.replace(match[0], match[1]);
            } else {
                func = string;
                match[1] = '${'+func+'}';
            }
            match.fn = new Function("data", "var out = ''; try { out = "+func+"; } catch(e) { out = e; } return out;");
        }

        return {string: source, vars: matches };
    },

    /**
     * Replaces a part of the template input.
     * @param str string
     * @param withWhat string to replace with
     * @returns {Template}
     */
    replace: function(str, withWhat) {
        this.input = this.input.replace(str,withWhat);
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
        var output = this.source.string;

        this.source.vars.forEach(function(match){
            output = output.replace(match[1], match.fn.apply(this,[data]));
        }.bind(this));

        return DEBUG ? beautify(output, {indent_size:2}) :  output;
    }
};

module.exports = Template;