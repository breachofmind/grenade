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