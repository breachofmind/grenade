"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('elseif', {
    evaluate: function(template)
    {
        this.setSource(`} else if(${this.args}) {`);
    },
});