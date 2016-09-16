"use strict";

var Tag = require('../tag');

Tag.extend('verbatim', {
    block:true,
    evaluate: function(template)
    {
        // Echo the scope inputs.
        this.setSource("__out += "+JSON.stringify(this.scope.input));
    }
});