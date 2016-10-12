"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('set', {
    parse: function(args)
    {
        var k,v;
        [k,v] = args.split(/\s*\=\s*/,2);
        return {
            key: k,
            val: v
        }
    },
    evaluate: function(template)
    {
        this.setSource(`var ${this.args.key} = ${this.args.val};`);
    }
});