"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('stack', {
    evaluate: function(template)
    {
        if (template.root.hasOwnProperty('stacks') && template.root.stacks[this.args]) {
            var stack = template.root.stacks[this.args];

            var source = [];
            for (var i=0;i<stack.length; i++)
            {
                source.push(stack[i].scope.source);
            }
            this.source = source.join("\n");
        }
    }
});