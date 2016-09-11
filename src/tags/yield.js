var Tag = require('../tag');
var utils = require('../utils');

/**
 * Yields a section block with the given section name.
 * Used in conjunction with the @layout and @section tags.
 */
Tag.extend('yield', {
    evaluate: function() {
        if (this.template.parent.sections) {
            var tag = this.template.parent.sections[this.args]; // TagObject
            tag.source = tag.scope.source;
            this.replaceWith(tag);
        }
    }
});
