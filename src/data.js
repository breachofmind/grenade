"use strict";
var _ = require('lodash');
var utils = require('./utils');

const MODE_ESCAPE = 8;
const MODE_RAW = "=";
const MODE_COMMENT = "#";
const RX_ARG_SPLIT = /\s*\,\s*(?![^,]+\])/;

function DataObject(scope,parent)
{
    this.scope  = scope || {};
    this.parent = parent || null;
}

DataObject.prototype = {

    /**
     * Parses the property string provided.
     * Could be a string, comment, or function.
     * @param string
     * @returns {{property: string, args: array|null, mode: number}}
     * @private
     */
    _parse: function(string)
    {
        // var, =var, func(arg,arg,...)
        var property = _.unescape(string),
            args = null,
            str,
            mode=MODE_ESCAPE;

        switch(property[0]) {
            case MODE_RAW:
                mode = MODE_RAW;
                property = property.replace(mode,"");
                break;
            case MODE_COMMENT:
                mode = MODE_COMMENT;
                property = property.replace(mode,"");
                break;
        }

        // Check if the property is a function call.
        if (property.indexOf("(") > -1 && property.indexOf(")") > -1) {
            var parts = property.split("(");
            property = parts[0];
            str = parts[1].replace(")","");
            args = str == "" ? [] : str.split(RX_ARG_SPLIT);
        }
        return {property: property, args: this._args(args), mode:mode};
    },

    _args: function(args)
    {
        if (! args) return null;
        return args.map(function(str) {
            return eval(str);
        })
    },


    prop: function(property,template)
    {
        var input = typeof property == 'string' ? this._parse(property) : property;

        if (input.mode === MODE_COMMENT) {
            return "";
        }
        var value = this.value(input.property);

        // Is it a function?
        if (typeof value == 'function') {
            return value.apply(this.scope, input.args);
        }
        return input.mode === MODE_ESCAPE ? _.escape(value) : value;
    },


    value: function(property)
    {
        var value = _.get(this.scope, property);
        if (! value) {
            return this.parent ? this.parent.value(property) : null;
        }
        return value;
    },

    tag: function(key,template)
    {
        var match = template.matches[key];
        return match.tag.render(this, match);
    }
};

module.exports = DataObject;