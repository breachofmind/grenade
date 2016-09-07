var Tag = require('./tag');
var Template = require('./template');

function evaluate(args,template)
{
    return eval(args);
}

module.exports = function(factory)
{
    Tag.extend('extends', {
        parse: evaluate,
        evaluate: function(tag,template) {
            template.output[tag.start] = new Template(factory.contents(tag.args),template);
        }
    });


    Tag.extend('section', {
        block: true,
        parse: evaluate,
        evaluate: function(tag,template) {
            if (template.sections[tag.args]) {
                template.sections[tag.args](tag.scope);
            }
            template.output[tag.start] = "";
        }
    });


    Tag.extend('yield', {
        parse: evaluate,
        evaluate: function(tag,template) {
            if (! template.parent.sections) {
                template.parent.sections = {};
            }
            template.parent.sections[tag.args] = function(scope) {
                template.output[tag.start] = scope;
            }
        }
    });

    Tag.extend('include', {
        parse: evaluate,
        evaluate: function(tag,template) {
            template.output[tag.start] = new Template(factory.contents(tag.args),template);
        }
    });

    Tag.extend('foreach', {
        block: true,
        parse: function(args,template) {
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

        evaluate: function(tag,template) {
            template.output[tag.start] = this.render;
        },

        render: function(data) {
            var out = "";
            var array = data.items;
            array.forEach(function(object){
                out+= "1";

            });

            return out;
        }
    });


    Tag.extend('if', {
        block: true,
    });
    Tag.extend('unless', {
        block: true
    });

};