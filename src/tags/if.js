"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('if', {
    block:true,
    evaluate: function(template)
    {
        this.source = `
        if(${this.args}){
            ${this.scope.source}
        }
        `;
    }
});