"use strict";

var Tag = require('../tag');

Tag.extend('stack', {
    evaluate: function(template)
    {
        var name = this.args;

        this.setSource(`
            if(__stacks["${name}"]) {
              var __stack = __stacks["${name}"];
                for(var i=0; i<__stack.length; i++){
                    __out += __stack[i];
                }
            }
        `);
    }
});