"use strict";

var Tag = require('../tag');
var utils = require('../utils');

/**
 * Render the block within a 'with' scope,
 * Which allows you to leave off an object prefix.
 */
Tag.extend('with', {
    block:true,
    evaluate: function(template)
    {
        this.setSource(`
            with(${this.args}) {
                ${this.scope.source}
            }
        `);
    }
});