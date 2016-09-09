"use strict";

var _     = require('lodash');
var utils = require('./utils');
var TagObject = require('./match');
var Walker = require('./walker');

module.exports = function(compiler)
{
    class Template
    {
        get compiler()
        {
            return compiler;
        }

        constructor(input,parent)
        {
            var walker = new Walker(this);

            this.input = Array.isArray(input) ? input : input.split(utils.RX_TAGS);
            this.parent = parent;
            this.output = [];

            walker.walk();
            this.output.map(function(object) {
                if (object instanceof TagObject) object.evaluate();
            });

            this.source = this.generateSource();
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

        //
        //prop(data, args)
        //{
        //    var value = this.value(data,args.property);
        //    return args.mode ?  value : _.escape(value);
        //}
        //

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

    return Template;
};