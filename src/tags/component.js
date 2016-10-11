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
        this.scope = template.compiler.make(this.args, template);
    },
    render: function(data,done)
    {
        return "TESTING";
    }
});