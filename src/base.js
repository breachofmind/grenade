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
            template.replace(match.input,str);
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
            template.replace(match.input,Tag.renderer(match));
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
            template.erase(match.input);
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
                template.replace(match.input, template.sections[name].scope);
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
            var parts = args.trim().split(" in ");
            array = parts[1];
            if (_.startsWith(parts[0],"(")) {
                var tracking = parts[0].replace(/[\(|\)]/g,"").split(",",2);
                index = tracking[0];
                key = tracking[1];
            } else {
                key = parts[0];
            }
            return {key: key, array: array, idx:index}
        },

        evaluate: function(template,match)
        {
            match.scope = new Template(match.scope, match);
            template.replace(match.input, Tag.renderer(match));
        },

        render: function(data,match)
        {
            var out = [];
            var array = data.value(match.args.array);

            _.each(array, function(object,i) {
                var scopeObject = {};
                scopeObject[match.args.key] = object;
                if (match.args.idx) scopeObject[match.args.idx] = i.toString();
                out.push(match.scope.render( new Data(scopeObject,data)) );
            });

            return out.join("");
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
            match.scope = new Template(match.scope, match);
            template.replace(match.input, Tag.renderer(match));
        },

        render: conditional(false)
    });

    Tag.extend('unless', {
        block:true,
        parse: function(args)
        {
            return args;
        },
        evaluate: function(template,match)
        {
            match.scope = new Template(match.scope, match);
            template.replace(match.input, Tag.renderer(match));
        },
        render: conditional(true)
    })
};

function conditional(reverse)
{
    return function(data,match)
    {
        var hasElse = match.scope.input.indexOf('@else') > -1;
        var expression = match.args;
        var truthy = (function(__data){
            var __keys = Object.keys(__data);
            for(var i=0; i<__keys.length; i++) {
                eval("var "+__keys[i]+" = __data[__keys[i]];");
            }
            return eval(expression);
        })(data);

        if (! truthy) {
            if (reverse) {
                return hasElse ? match.scope.render(data).split("@else",2)[0] : match.scope.render(data);
            }
            return hasElse ? match.scope.render(data).split("@else",2)[1] : "";
        }
        if (reverse) {
            return hasElse ? match.scope.render(data).split("@else",2)[1] : "";
        }
        return hasElse ? match.scope.render(data).split("@else",2)[0] : match.scope.render(data);
    }
}