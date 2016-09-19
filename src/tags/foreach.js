"use strict";

var Tag = require('../tag');
var utils = require('../utils');

Tag.extend('foreach', {
    block:true,
    parse: function(args,template) {
        return utils.parseForEach(args);
    },

    evaluate: function(template)
    {
        var args = this.args;

        this.setSource(`
        (function(){
            for(var ${args.index} in ${args.array}) {
                var ${args.key}=${args.array}[${args.index}];
                ${this.scope.source}
            }

        })();
        `);
    }
});