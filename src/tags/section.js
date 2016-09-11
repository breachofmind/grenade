var Tag = require('../tag');
var utils = require('../utils');

/**
 * Create a new section block for a layout.
 * Used in conjunction with @extends and @yield.
 */
Tag.extend('section', {
    block: true,
    parse: function(args) {
        var name = eval(args);
        if (! this.template.sections) this.template.sections = {};
        this.template.sections[name] = this;
        return name;
    },
    evaluate: function() {
        this.erase();
    },
    render: function(data) {
        return this.scope.render(data);
    }
});
