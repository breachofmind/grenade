"use strict";

var Tag = require('../tag');

Tag.extend('include', {
    evaluate: function(template) {
        var include = template.compiler.make(this.args, template);

        this.replaceWith (include);
    }
})