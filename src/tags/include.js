var Tag = require('../tag');
var Template = require('../template');
var utils = require('../utils');

/**
 * Include a file at the tag location.
 * A file can be a regular template or a template with a layout
 */
Tag.extend('include', {
    evaluate: function() {
        var compiler = this.template.compiler;
        this.replaceWith(new Template(compiler.contents(this.args), this.template));
    }
});
