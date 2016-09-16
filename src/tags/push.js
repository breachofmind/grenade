"use strict";

var Tag = require('../tag');

Tag.extend('push', {
    block:true,
    evaluate: function(template)
    {
        var name = this.args;

        this.setSource(`
        if(! __stacks["${name}"]) { __stacks["${name}"] = []; }
            __stacks["${name}"].push((function(){
                var __out = "";
                ${this.scope.source}
                return __out;
            }) ());
        `);
    }
});