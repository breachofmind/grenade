"use strict";

var Tag = require('../tag');

Tag.extend('if', {
    block:true,
    evaluate: function(template)
    {
        var src = `
        if(${this.args}){
            ${this.scope.source}
        }
        `;

        this.source = src;
    }
});