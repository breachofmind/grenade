"use strict";

var Tag = require('../tag');

Tag.extend('elseif', {
    evaluate: function(template)
    {
        this.setSource(`} else if(${this.args}) {`);
    },
});