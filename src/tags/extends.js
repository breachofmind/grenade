"use strict";

var Tag = require('../tag');

Tag.extend('extends', {
    evaluate: function(template) {
        this.replaceWith (template.compiler.make(this.args,template));
    }
})