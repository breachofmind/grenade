"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('section', {
    block:true,
    parse: function(args,template) {
        if (! template.sections) {
            template.sections = {};
        }
        template.sections[args] = this;
        return args;
    },

    evaluate: function(template) {
        this.replaceWith("");
    }
});