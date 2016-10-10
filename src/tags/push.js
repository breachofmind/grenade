"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('push', {
    block:true,
    parse: function(args,template)
    {
        if (! template.root.stacks) {
            template.root.stacks = {};
        }
        if (! template.root.stacks[args]) {
            template.root.stacks[args] = [];
        }

        return args;
    },
    evaluate: function(template)
    {
        template.root.stacks[this.args].push(this);
        this.replaceWith("");
    },
});