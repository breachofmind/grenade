var Tag = require('../tag');
var Template = require('../template');
var utils = require('../utils');

Tag.extend('if', {

    block: true,

    parse: function(args) {
        return new Function('data', `with(data) { return ${args}; }`);
    },

    evaluate: function()
    {
        this.trueScope = this.scope;
        this.falseScope = null;

        // find the else statement.
        var $else = this.scope.output.indexOf('@else');
        if ($else > -1) {
            var split = utils.splitAt(this.scope.output, $else);
            this.trueScope = new Template(split[0], this.template);
            this.falseScope = new Template(split[1], this.template);
        }
    },

    render: function(data)
    {
        var truthy = this.args.apply(this,[data]);

        if (truthy) {
            return this.trueScope.render(data);
        }

        return this.falseScope ? this.falseScope.render(data) : "";
    }
});