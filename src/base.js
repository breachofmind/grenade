var _ = require('lodash');
var Tag = require('./tag');
var Template = require('./template');
var Data = require('./data');

module.exports = function(factory)
{
    Tag.extend('extends', {
        parse: function(args) {
            return eval(args);
        },
        evaluate: function(template,match) {
            // Replace the tag in the template input.
            var str = factory.fileGetContents(match.args);
            template.replace(match.input,str);
            template.getTagMatches(['section','yield']);
        }
    });

    Tag.extend('include', {
        parse: function(args) {
            return eval(args);
        },
        evaluate: function(template,match) {
            var str = factory.fileGetContents(match.args);
            match.scope = new Template(str,match);
            template.replace(match.input,Tag.renderer(match));
        },
        render: function(data,match) {
            return match.scope.render(data);
        }
    });

    Tag.extend('section', {
        block: true,
        greedy:true,
        parse: function(args) {
            return eval(args);
        },
        evaluate: function(template,match) {
            // Store the sections for later use.
            var name = match.args;
            if (! template.sections) template.sections = {};
            template.sections[name] = match;

            // Erase from the template.
            template.erase(match.input);
        }
    });

    Tag.extend('yield', {
        parse: function(args) {
            return eval(args);
        },
        evaluate: function(template,match) {
            var name = match.args;
            if (template.sections[name]) {
                template.replace(match.input, template.sections[name].scope);
            }
        }
    });

    Tag.extend('foreach', {
        block:true,
        parse: function(args) {
            // "key in arr"
            // "(index,key) in arr"
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

        evaluate: function(template,match) {
            match.scope = new Template(match.scope, match);
            // replace with an value accessor function.
            template.replace(match.input, Tag.renderer(match));
        },

        render: function(data,match) {
            var out = [];
            var array = data.value(match.args.array);

            array.forEach(function(object,i) {
                var scopeObject = {};
                scopeObject[match.args.key] = object;
                if (match.args.idx) scopeObject[match.args.idx] = i.toString();
                out.push(match.scope.render( new Data(scopeObject,data)) );
            });

            return out.join("");
        }
    });


    Tag.extend('if', {
        block:true,
        parse: function(args) {
            // args will be an expression of the data.
            // var == 3, var.id > 4, etc.
            return args;
        },

        evaluate: function(template,match) {
            match.scope = new Template(match.scope, match);
            template.replace(match.input, Tag.renderer(match));
        },

        render: function(data,match) {
            var expression = match.args;

            var truthy = (function(__data){
                var __keys = Object.keys(__data);
                for(var i=0; i<__keys.length; i++) {
                    eval("var "+__keys[i]+" = __data[__keys[i]];");
                }
                return eval(expression);
            })(data);

            if (! truthy) {
                return "";
            }
            return match.scope.render(data);
        }
    })
};