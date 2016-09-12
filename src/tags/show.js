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
        var out = [];
        var pairs = args.split(",");
        for (var i=0; i<pairs.length; i++) {
            var parts = pairs[i].split(":");

            // class: expression
            var className = parts[0].trim();
            var expression = parts[1].trim();
            out.push(`"${className}" : ${expression}`);
        }
        var src = `
        with(data) {
            var src = {${out.join(",")}};
            var out = [];
            for (var className in src) {
                if (src[className]) out.push(className);
            }
            return out.join(" ");
        }`;

        return new Function('data', src);
    },

    render: function(data)
    {
        return this.args.apply(this,[data]);
    }
});
