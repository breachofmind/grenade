"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('verbatim', {
    block:true,
    evaluate: function(template)
    {
        // Echo the scope inputs.
        this.setSource("__out += "+JSON.stringify(this.scope.input));
    }
});