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

        this.fn = new Function('data,rethrow', `
            var __out = "";
            try { __out = ${this.source == "" ? "''" : this.source}; } catch(e) { __out = rethrow(e); }
            return __out;;
        `);
    }

    /**
     * Get the template level depth.
     * @returns {number}
     */
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
        var source = [];
        for(var i=0; i<this.output.length; i++)
        {
            var object = this.output[i];

            if (!object) {
                object = "";
            }
            if (typeof object == 'string') {
                source.push ( JSON.stringify(object) ); continue;
            }
            if (object instanceof Template || object instanceof MatchVar) {
                source.push ( object.source ); continue;
            }
            if (object instanceof MatchTag) {
                source.push ( object.name == 'section' ? object.scope.source : object.source );
            }
        }
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
        return this.fn(data,rethrow);
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