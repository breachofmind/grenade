"use strict";

var Tag = require('../tag');

Tag.extend('foreach', {
    block:true,
    parse: function(args,template) {
        var parts = args.trim().split(" in ",2);
        var array = parts[1];
        var key = parts[0];
        var index = "i";

        // If the first character is parenthesis...
        if (parts[0][0] == "[") {
            var tracking = parts[0].replace(/[\[|\]]/g,"").split(",",2);
            index = tracking[0];
            key = tracking[1];
        }
        return {key: key, array: array, index:index}
    },

    evaluate: function(template)
    {
        var args = this.args;

        this.source = `
        for(var ${args.index} in ${args.array}) {
            var ${args.key}=${args.array}[${args.index}];
            ${this.scope.source}
        }
        `;
    }
});