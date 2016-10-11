"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');
var moment = require('moment');

Tag.extend('date', {
    passArguments: true,
    render: function(data)
    {
        if (typeof this.args == 'string') {
            return moment().format(this.args);
        } else if(Array.isArray(this.args)) {
            return moment(this.args[0]).format(this.args[1]);
        }
    }
});