"use strict";

var _     = require('lodash');
var utils = require('./utils');
var MatchTag = require('./matchTag');
var MatchVar = require('./matchVar');
var walk = require('./walker');

const RX_TAGS = /\s*?(\@.*[^\s+])/gm;

/**
 * The template class.
 * Splits incoming strings/arrays and generates javascript source code.
 * @author Mike Adamczyk <mike@bom.us>
 */
class Template
{
    /**
     * Create a new template object.
     * @param input string|array
     * @param parent Template|null
     * @param compiler Compiler|null
     */
    constructor(input,parent,compiler)
    {
        this.input = Array.isArray(input) ? input : input.split(RX_TAGS);
        this.output = [];
        this.parent = parent;
        this.compiler = compiler || this.parent.compiler;

        walk(this);

        this.source = this.generateSource();
    }

    get level()
    {
        var parent = this.parent,
            level = 0;
        while(parent) {
            parent = parent.parent;
            level ++;
        }
        return level;
    }

    /**
     * Generate the javascript source code from the output.
     * @returns {string}
     */
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
            if (object instanceof MatchTag) {
                return object.name == 'section' ? object.scope.source : object.source;
            }
            if (object instanceof MatchVar) {
                return object.source;
            }
        });

        return source.join(" + ");
    }

    /**
     * Process and render a tag.
     * @param data object
     * @param index number
     * @returns {*}
     */
    tag(data, index)
    {
        //var match = this.root.tags[index];
        var match = this.compiler.tags[index];
        return match.render(data);
    }

    /**
     * Process and render a variable.
     * @param data object
     * @param index number
     * @returns {*}
     */
    prop(data,index)
    {
        var object = this.compiler.vars[index];
        var value = this.value(data,object.property);
        if (typeof value !== 'undefined') {
            return object.mode ? value.toString() : _.escape(value).toString();
        }
        return value;
    }

    /**
     * Get the value of a property.
     * @param data object
     * @param property string
     * @returns {*}
     */
    value(data, property)
    {
        // data is the current scoped value.
        var value = _.get(data, property);
        if (typeof value=='undefined' && data.$parent) {
            return this.value(data.$parent, property);
        }
        return value;
    }

    /**
     * Render the template.
     * @param data
     * @returns {*}
     */
    render(data)
    {
        if (! this.source || this.source == "") {
            return "";
        }
        var src = `
        var __out = "";
        try { __out = ${this.source}; } catch(e) { __out = rethrow(e); }
        return __out;
        `;
        var fn = new Function('data, rethrow', src);

        return fn.apply(this,[data,rethrow]);
    }

    /**
     * Return the template as a string.
     * @returns {string|*}
     */
    toString()
    {
        return this.source;
    }
}

function rethrow(e) {
    return e;
}

module.exports = Template;