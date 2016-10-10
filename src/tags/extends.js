"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('extends', {
    evaluate: function(template) {
        this.replaceWith (template.compiler.make(this.args,template));
    }
})