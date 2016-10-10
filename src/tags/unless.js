"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('unless', {
    block:true,
    evaluate: function(template)
    {
        this.setSource(`
            if(! (${this.args})){
                ${this.scope.source}
            }
        `);
    }
});