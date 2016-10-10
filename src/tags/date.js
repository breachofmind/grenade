"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');
var moment = require('moment');

Tag.extend('date', {
    passArguments: true,
    render: function(data,args,template)
    {
        if (typeof args == 'string') {
            return moment().format(args);
        } else if(Array.isArray(args)) {
            return moment(args[0]).format(args[1]);
        }

    }
});