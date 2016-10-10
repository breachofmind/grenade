"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('for', {
    block:true,
    evaluate: function(template)
    {
        this.setSource(`
            for(${this.args}) {
                ${this.scope.source}
            }
        `);
    }
});