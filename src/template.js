"use strict";

var _     = require('lodash');
var fs    = require('fs');
var path  = require('path');
var utils = require('./utils');
var Tag   = require('./tag');
var TagObject = require('./match');
var Walker = require('./walker');

class Template
{
    constructor(input,parent)
    {
        var walker = new Walker(this);

        this.input = Array.isArray(input) ? input : input.split(utils.RX_TAGS);
        this.parent = parent;
        this.output = [];

        if (! this.parent) {
            this.tags = [];
        }

        walker.walk();
        this.output.map(function(object) {
            if (object instanceof TagObject) object.evaluate();
        });

        this.source = this.javascript();
    }

    get root()
    {
        var parent = this.parent;
        if (! parent) return this;
        while(parent.parent) {
            parent = parent.parent;
        }
        return parent;
    }

    javascript()
    {
        var src = [];
        for (var i=0; i< this.output.length; i++)
        {
            var object = this.output[i];

            if (typeof object == 'string') {
                src.push (JSON.stringify(object));
            }
            else if (object instanceof Template) {
                src.push (object.source);
            }
            else if (object instanceof TagObject) {
                src.push (`this.tag(data, ${object.key})`);
            }
            else if (Array.isArray(object)) {
                src.push (object.source());
            }
        }

        return src.join(" + ");
    }

    tag(data, index)
    {
        var match = this.root.tags[index];
        return match.render(data);
    }

    prop(data, args)
    {
        var value = this.value(data,args.property);
        return args.mode ?  value : _.escape(value);
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