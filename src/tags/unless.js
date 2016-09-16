"use strict";

var Tag = require('../tag');

Tag.extend('unless', {
    block:true,
    evaluate: function(template)
    {
        this.source = `
        if(! (${this.args})){
            ${this.scope.source}
        }
        `;
    }
});