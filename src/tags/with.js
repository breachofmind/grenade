"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

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