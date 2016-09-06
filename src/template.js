"use strict";

var _     = require('lodash');
var fs    = require('fs');
var path  = require('path');
var utils = require('./utils');
var Promise = require('bluebird');
var Tag   = require('./tag');
var beautify = require('js-beautify').html;

const VAR_RX = /\$\{((?!\_\_).*?)\}/gm;
const FUNC_RX = /\$\{(\_\_.*?)\}/gm;

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
    this.getVarMatches();

    this.source = this.generateSource();
}


Template.prototype = {

    /**
     * Return the root matching tag.
     * @returns {Template}
     */
    root: function()
    {
        var parent = this.parent;
        while (parent) {parent = parent.parent;}
        return parent;
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
     * Match variables in the input text and replace with accessors.
     * @returns void
     */
    getVarMatches: function()
    {
        utils.eachMatch(VAR_RX, this, function(match) {
            var string = match[1];
            var args = "";
            if (string[0] == "=" || string[0] == "#") {
                args = '"'+ _.escape(string.replace(string[0],""))+'"';
                args += ',"'+string[0]+'"';
            } else {
                args = '"'+ _.escape(string)+'"';
            }

            var func = '${__data.prop('+args+')}';

            this.input = utils.replaceAt(this.input,match.index,match.index + match[0].length, func);

        }.bind(this))
    },

    /**
     * Creates accessor functions for ${variable} data.
     * This is evaluated when the template is rendered later.
     * @returns object
     */
    generateSource: function()
    {
        var output = this.input.split(FUNC_RX);

        var source = output.map(function(part) {
            if (part[0] != "_") {
                return JSON.stringify(part);
            }
            return part;
        }).join(" + ");

        return new Function("__data", "var out = ''; try { out = "+source+"; } catch(e) { out = e; }; return out;");
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
        return this.source.apply(this,[data]);
    }
};

module.exports = Template;