var _ = require('lodash');
var Tag = require('./tag');
var Template = require('./template');
var Data = require('./data');

module.exports = function(factory)
{
    /**
     * Extends a template from a parent layout template.
     * Include it at the top of the document.
     * @usage
     * @extends("dir/filename")
     */
    Tag.extend('extends', {
        parse: function(args)
        {
            return eval(args);
        },

        evaluate: function(template,match)
        {
            // Replace the tag with the layout once it is loaded.
            var str = factory.fileGetContents(match.args);
            match.replace(str);
            template.getTagMatches(['section','yield']);
        }
    });

    /**
     * Includes a file at the tag position.
     * @usage
     * @include("dir/filename")
     */
    Tag.extend('include', {
        parse: function(args)
        {
            return eval(args);
        },

        evaluate: function(template,match)
        {
            var str = factory.fileGetContents(match.args);
            match.scope = new Template(str,match);
            match.replace(Tag.renderer(match));
        },

        render: function(data,match)
        {
            return match.scope.render(data);
        }
    });

    /**
     * A section tag is used in conjunction with a @extends and @yield tag.
     * construct is false because they are called from the extend tag.
     * @usage
     * @extends("dir/filename")
     * @section("name")
     * ... html
     * @endsection
     */
    Tag.extend('section', {
        block: true,
        construct:false,
        greedy:true,

        parse: function(args)
        {
            return eval(args);
        },

        evaluate: function(template,match)
        {
            // Store the sections for later use.
            var name = match.args;
            if (! template.sections) template.sections = {};
            template.sections[name] = match;

            // Erase from the template.
            match.replace("");
        }
    });

    /**
     * When using @extends layouts, this will yield a section with the given name.
     * @usage
     * @yield("section-name")
     */
    Tag.extend('yield', {
        construct:false,
        parse: function(args)
        {
            return eval(args);
        },

        evaluate: function(template,match)
        {
            var name = match.args;
            if (template.sections[name]) {
                match.replace(template.sections[name].scope);
            }
        }
    });

    /**
     * A loop control structure handy for arrays.
     * @usage
     * @foreach(item in items)
     * ...
     * @endforeach
     * or,
     * @foreach((i,item) in items)
     * ...
     * @endforeach
     */
    Tag.extend('foreach', {
        block:true,
        parse: function(args)
        {
            var index,key,array;
            var parts = args.trim().split(" in ",2);
            array = parts[1];
            key = parts[0];

            // If the first character is parenthesis...
            if (parts[0][0] == "(") {
                var tracking = parts[0].replace(/[\(|\)]/g,"").split(",",2);
                index = tracking[0];
                key = tracking[1];
            }
            return {key: key, array: array, index:index}
        },

        evaluate: function(template,match)
        {
            match.scope = new Template(match.scope, match);
            match.replace(Tag.renderer(match));
        },

        render: function(data,match)
        {
            var out = "";
            var array = data.value(match.args.array);

            _.each(array, function(object,i) {
                var scopeData = {};
                scopeData[match.args.key] = object;
                if (match.args.index) scopeData[match.args.index] = i.toString();
                out += match.scope.render( new Data(scopeData,data));
            });

            return out;
        }
    });

    /**
     * If/Else control structure.
     * @usage
     * @if(expression)
     * ... truthy
     * @endif
     * or
     * @if(expression)
     * ... truthy
     * @else
     * ... not truthy
     * @endif
     */
    Tag.extend('if', {
        block:true,
        parse: function(args)
        {
            // args will be an expression of the data.
            // var == 3, var.id > 4, etc.
            return args;
        },

        evaluate: function(template,match)
        {
            // Split the input into separate templates for if/else.
            var statements = match.scope.split("@else");
            match.scope = [new Template(statements[0],match)];
            if (statements.length > 1) {
                match.scope.push(new Template(statements[1],match));
            }
            match.replace(Tag.renderer(match));

        },

        render: conditional(false)
    });

    /**
     * Conditional, which is the inverse of @if
     */
    Tag.extend('unless', {
        block:true,
        parse: function(args)
        {
            return args;
        },
        evaluate: function(template,match)
        {
            // Split the input into separate templates for if/else.
            var statements = match.scope.split("@else");
            match.scope = [new Template(statements[0],match)];
            if (statements.length > 1) {
                match.scope.push(new Template(statements[1],match));
            }
            match.replace(Tag.renderer(match));
        },

        render: conditional(true)
    })
};

/**
 * A function for checking if/else/unless during rendering.
 * @param inverse
 * @returns {Function}
 */
function conditional(inverse)
{
    return function(data,match)
    {
        var hasElse = match.scope.length > 1;
        var expression = match.args;
        var keys = Object.keys(data.scope).map(function(key) {
            return "var "+key+"="+JSON.stringify(data.scope[key])+";";
        });
        var fn = new Function('data', keys.join("")+" return "+expression+";");
        var truthy = fn(data);

        if (! truthy) {
            if (inverse) {
                return match.scope[0].render(data); // Unless
            }
            return hasElse ? match.scope[1].render(data): ""; // If
        }

        if (inverse) {
            return hasElse ? match.scope[1].render(data) : ""; // Unless
        }
        return match.scope[0].render(data); // If
    }
}