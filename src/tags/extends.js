var Tag = require('../tag');
var Template = require('../template');
var utils = require('../utils');

/**
 * Uses a parent layout for a given template.
 * Use with @yield and @section tags.
 */
Tag.extend('extends', {
    evaluate: function() {
        var compiler = this.template.compiler;
        this.replaceWith(compiler.make(this.args, this.template));
    }
});