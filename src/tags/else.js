"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('else', {
    hasArguments: false,
    evaluate: function(template)
    {
        this.setSource("} else {");
    }
});