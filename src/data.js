"use strict";
var _ = require('lodash');
var utils = require('./utils');

const MODE_RAW      = "=";
const MODE_COMMENT  = "#";
const RX_ARG_SPLIT  = /\s*\,\s*(?![^,]+\])/;

function DataObject(scope,parent)
{
    /**
     * The current scope data.
     * @type {{}}
     */
    this.scope  = scope || {};

    /**
     * The parent scope data, if any.
     * @type {DataObject|null}
     */
    this.parent = parent || null;
}

DataObject.prototype = {

    /**
     * Parses the property string provided.
     * Could be a string, comment, or function.
     * Example: var, =var, #comment, func(), =func()
     * @param string
     * @returns {{property: string, args: array|null, mode: number}}
     * @private
     */
    _parse: function(string)
    {
        // Defaults.
        var output = {
            property: _.unescape(string),
            args: null,
        };

        // Check if the property is a function call.
        if (output.property.indexOf("(") > -1 && output.property.indexOf(")") > -1) {
            var parts = output.property.split("(");
            output.property = parts[0];
            var str = parts[1].replace(")","");
            output.args = str == "" ? [] : this._args(str.split(RX_ARG_SPLIT));
        }
        return output;
    },

    /**
     * Evaluate any arguments, if calling a function.
     * @param args
     * @returns {*}
     * @private
     */
    _args: function(args)
    {
        if (! args) return null;
        return args.map(function(str) {
            // str could be "argument" , argument, or [argument];
            var fn = new Function('data', "try { return "+str+" } catch (e) { return data.value('"+str+"'); }");
            return fn.apply(this,[this]);
        }.bind(this))
    },

    /**
     * Get the string value of a property.
     * The output value could be a comment, escaped HTML, or raw HTML.
     * @param property string
     * @param mode string
     * @returns {*}
     */
    prop: function(property,mode)
    {
        var input = typeof property == 'string' ? this._parse(property) : property;

        // Don't write the value of a comment into the output.
        if (mode === MODE_COMMENT) {
            return "";
        }
        var value = this.value(input.property);

        // Is it a function?
        if (typeof value == 'function') {
            value = value.apply(this.scope, input.args);
        }
        return mode == MODE_RAW ? value : _.escape(value);
    },

    /**
     * Get the value of the given property in the current scope.
     * If the value doesn't exist in the current scope,
     * Traverse upwards to the top-most scope.
     * @param property string
     * @returns {*}
     */
    value: function(property)
    {
        var value = _.get(this.scope, property);
        if (! value) {
            return this.parent ? this.parent.value(property) : null;
        }
        return value;
    },

    /**
     * Get the tag output, which contains logic on how to render the data.
     * Tags are indexed as they are found in the template.
     * @param key string
     * @param template Template
     * @returns {string}
     */
    tag: function(key,template)
    {
        var match = template.matches[key];
        return match.tag.render(this, match);
    }
};

module.exports = DataObject;