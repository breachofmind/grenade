"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

Tag.extend('component', {
    yaml: true,
    parse: function(args,template)
    {
        return "components/"+args;
    },
    evaluate: function(template)
    {
        this.replaceWith (template.compiler.make(this.args, template));
    }
});