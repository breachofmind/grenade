"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('show', {
    passArguments: true,

    parse: function(args,template)
    {
        var out = [];
        var pairs = args.split(",");
        pairs.forEach(function(pair) {
            var parts = pair.split(":");
            out.push(`"${parts[0].trim()}":${parts[1].trim()}`);
        });
        // Passed into the rendering function.
        return "{"+out.join(",")+"}";
    },

    render: function(data,args,template)
    {
        var out = [];
        var keys = Object.keys(args);
        for(var i=0; i<keys.length; i++) {
            if (args[keys[i]]) {
                out.push(keys[i]);
            }
        }
        return out.join(" ");
    }
});