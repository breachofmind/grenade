"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');
var append = utils.append;

Tag.extend('verbatim', {
    block:true,
    evaluate: function(template)
    {
        // Echo the scope inputs.
        this.setSource(append(JSON.stringify(this.scope.input)));
    }
});