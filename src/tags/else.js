"use strict";

var Tag = require('../tag');

Tag.extend('else', {
    hasArguments: false,
    evaluate: function(template)
    {
        this.source = "} else {";
    }
});