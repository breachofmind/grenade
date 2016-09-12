var Tag = require('../tag');
var utils = require('../utils');

/**
 * Shows the given strings if the expression is truthy.
 * Useful for applying classes to elements.
 * @example: <li class="@show(first: item.id==1)"></li>
 */
Tag.extend('show', {
    parse: function(args)
    {
        var out = {};
        var pairs = args.split(",");
        for (var i=0; i<pairs.length; i++) {
            var parts = pairs[i].split(":");

            // class: expression
            out[parts[0].trim()] = parts[1].trim();
        }
        return out;
    },

    evaluate: function()
    {
        var src = [];
        for (var className in this.args) {
            src.push(`"${className}" : ${this.args[className]}`);
        }
        this.source = `(function(){ with(data) {
            var src = {${src.join(",")}};
            var out = [];
            for (var className in src) {
                if (src[className]) out.push(className);
            }
            return out.join(" ");
        } })()`;
    }
});
