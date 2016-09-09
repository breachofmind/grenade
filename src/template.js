"use strict";

var _     = require('lodash');
var utils = require('./utils');
var TagObject = require('./match');
var walk = require('./walker');

const RX_TAGS = /\s*?(\@.*[^\s+])/gm;

/**
 * The template class.
 * Splits incoming strings/arrays and generates javascript source code.
 * @author Mike Adamczyk <mike@bom.us>
 */
class Template
{
    constructor(input,parent,compiler)
    {
        this.input = Array.isArray(input) ? input : input.split(RX_TAGS);
        this.parent = parent;
        this.compiler = compiler || this.parent.compiler;
        this.output = [];

        walk(this);

        this.source = this.generateSource();
    }

    generateSource()
    {
        var source = this.output.map(function(object) {
            if (!object) {
                object = "";
            }
            if (typeof object == 'string') {
                return JSON.stringify(object);
            }
            if (object instanceof Template) {
                return object.source;
            }
            if (object instanceof TagObject) {
                return object.name == 'section' ? object.scope.source : object.source;
            }
            if (object.hasOwnProperty('property')) {
                return `this.prop(data, ${object.index})`;
            }
        });

        return source.join(" + ");
    }

    tag(data, index)
    {
        //var match = this.root.tags[index];
        var match = this.compiler.tags[index];
        return match.render(data);
    }

    prop(data,index)
    {
        var object = this.compiler.vars[index];
        var value = this.value(data,object.property);
        return object.mode ? value : _.escape(value);
    }


    value(data, property)
    {
        // data is the current scoped value.
        var value = _.get(data, property);
        if (! value && data.$parent) {
            return this.value(data.$parent, property);
        }
        return value;
    }

    render(data)
    {
        var fn = new Function('data', `try { return ${this.source}; } catch(e) { return e; }`);

        return fn.apply(this,[data]);
    }
}

module.exports = Template;