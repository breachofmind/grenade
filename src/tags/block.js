"use strict";

var Tag     = require('../Tag');
var grenade = require('grenade');
var utils   = require('../support/utils');
var Promise = require('bluebird');
var _       = require("lodash");

var ComponentTag = Tag.get('component');


Tag.extend('block', {

    passArguments: true,

    block: true,

    isolate: true,

    /**
     * The argument is the component name, relative to the componentPath.
     * @param args string
     * @returns {*}
     */
    parse: ComponentTag.parse,

    evaluate: ComponentTag.evaluate,

    /**
     * Render the component.
     * @param data object
     * @param done function
     * @returns {*}
     */
    render: function(data,done)
    {
        return this.scope.render(data).then(result => {

            // Create an isolated scope of the data.
            // Also, render the block template and pass as an argument.
            // The parent data object is available via the $parent property.
            data = {$parent:data, $block: result};

            var out = this.component.render(data);

            if (out instanceof Promise) {
                return out.then(result => { return done(result) });
            }
            return done(out);
        });
    }
});