var _ = require('lodash');
var Tag = require('./tag');
var Template = require('./template');

module.exports = function(compiler)
{
    Tag.extend('extends', {
        evaluate: function() {
            this.replaceWith(new Template(compiler.contents(this.args), this.template));
        }
    });


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


    Tag.extend('yield', {
        evaluate: function() {
            if (this.template.parent.sections) {
                var tag = this.template.parent.sections[this.args]; // TagObject
                tag.source = tag.scope.source;
                this.replaceWith(tag);
            }
        }
    });

    Tag.extend('include', {
        evaluate: function() {
            this.replaceWith(new Template(compiler.contents(this.args), this.template));
        }
    });

    Tag.extend('foreach', {
        block: true,
        parse: function(args) {
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

        render: function(data) {
            var out = [];
            var array = this.template.value(data, this.args.array) || [];

            array.forEach(function(object, i) {
                var copy = {
                    $parent: _.clone(data)
                };
                copy[this.args.key] = object;
                if (this.args.index) copy[this.args.index] = i;

                out.push(this.scope.render(copy));
            }.bind(this));

            return out.join("");
        }
    });


    Tag.extend('if', {
        block: true,
        parse: function(args) {
            return new Function('data', `with(data) { return ${args}; }`);
        },
        evaluate: function()
        {
            this.ifTrue = this.scope;
            this.ifFalse = null;

            // find the else statement.
            var $else = this.scope.output.indexOf('@else');
            if ($else > -1) {
                var truthy = [], falsey = [];
                var outputs = this.scope.output;
                for (var i=0; i<outputs.length; i++) {
                    if (i<$else) truthy.push(outputs[i]);
                    if (i>$else) falsey.push(outputs[i]);
                }
                this.ifTrue = new Template(truthy, this.template);
                this.ifFalse = new Template(falsey, this.template);
            }
        },

        render: function(data)
        {
            var truthy = this.args.apply(this,[data]);

            if (truthy) {
                return this.ifTrue.render(data);
            }

            return this.ifFalse ? this.ifFalse.render(data) : "";
        }
    });


    Tag.extend('unless', {
        block: true,
        parse: function(args) {
            return args;
        },
        evaluate: function(tag,template)
        {
            //template.output[tag.start] = tag;
        }
    });
};