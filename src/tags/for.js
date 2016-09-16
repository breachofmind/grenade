"use strict";

var Tag = require('../tag');

Tag.extend('for', {
    block:true,
    evaluate: function(template)
    {
        this.source = `
        for(${this.args}) {
            ${this.scope.source}
        }
        `;
    }
});