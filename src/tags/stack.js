"use strict";

var Tag = require('../tag');

Tag.extend('stack', {
    evaluate: function(template)
    {
        var stack = template.root.stacks[this.args];
        if (! stack) {
            return;
        }
        var source = [];
        for (var i=0;i<stack.length; i++)
        {
            source.push(stack[i].scope.source);
        }
        this.source = source.join("\n");
    }
});