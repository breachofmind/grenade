"use strict";

var Tag     = require('../Tag');
var grenade = require('grenade');
var utils   = require('../support/utils');
var _       = require("lodash");

Tag.extend('component', {

    passArguments: true,

    /**
     * The argument is the component name, relative to the componentPath.
     * @param args string
     * @returns {*}
     */
    parse: function(args)
    {
        var moduleName, arr;

        [moduleName, ...arr] = args.split(/\,\s*/g,2);

        return {
            name: moduleName,
            params: arr,

            // This gets passed to the render method
            // when being eval'ed at runtime.
            toString: function() { return `{ name:"${moduleName}", params:${arr[0]} }` }
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

        if (! (instance instanceof grenade.Component)) {
            throw new Error(`"${this.args.name}" not a Component instance`);
        }
        // Isolated scope for the Template.
        // This means it is a 'root' Template.
        instance.scope = template.compiler.make(instance.view, null, template.compiler);
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

        if (this.template.compiler.promises) {

            return this.component.render(data).then(result => {
                done(result);
            });
        }

        return this.component.render(data);
    }
});