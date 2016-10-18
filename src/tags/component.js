"use strict";

var Tag     = require('../Tag');
var grenade = require('grenade');
var utils   = require('../support/utils');
var Promise = require('bluebird');
var _       = require("lodash");

var args = {

    passArguments: true,

    /**
     * The argument is the component name, relative to the componentPath.
     * @param args string
     * @returns {*}
     */
    parse: function(args)
    {
        var parts = args.split(",");
        var moduleName = parts.shift().replace(/\./g,"/");
        var params = parts.join(",").trim();
        return {
            name: moduleName,
            params: params,

            // This gets passed to the render method
            // when being eval'ed at runtime.
            toString: function() { return `{ name:"${moduleName}", params:${params} }` }
        }
    },

    /**
     * Create an instance of the component
     * and assign a Template to the scope based on the component's view property.
     * @param template Template
     */
    evaluate: function(template)
    {
        var Component = require(template.compiler.componentPath + this.args.name);
        var instance  = new Component (this);
        var compiler  = template.compiler;

        if (! (instance instanceof grenade.Component)) {
            throw new Error(`"${this.args.name}" not a Component instance`);
        }
        // Isolated scope for the Template.
        // This means it is a 'root' Template.
        instance.scope = instance.view ? compiler.make(instance.view, null, compiler) : compiler.template(instance.template, null);
        this.component = instance;
    },

    /**
     * Render the component.
     * @param data object
     * @param done function
     * @returns {*}
     */
    render: function(data,done)
    {
        // Create an isolated scope of the data.
        // The parent data object is available via the $parent property.
        data = {$parent:data};

        var out = this.component.render(data);

        if (out instanceof Promise) {
            return out.then(result => { return done(result) });
        }
        return done(out);
    }
};

Tag.extend('component', args);
Tag.extend('cmp', args);