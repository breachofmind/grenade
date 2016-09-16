"use strict";

var Tag = require('../tag');

Tag.extend('elseif', {
    evaluate: function(template)
    {
        this.source = `} else if(${this.args}) {`;
    },
});