"use strict";

var Tag = require('../tag');

Tag.extend('yield', {
    evaluate: function(template) {

        if (template.parent.sections[this.args]) {
            var tag = template.parent.sections[this.args];
            tag.index = this.index;
            tag.source = tag.scope.source;

            return this.replaceWith(tag);
        }

        // Template section wasn't found.
        return this.replaceWith("");
    }
});