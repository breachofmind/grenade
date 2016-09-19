"use strict";

var Tag = require('../tag');
var utils = require('../utils');
var moment = require('moment');

Tag.extend('date', {
    render: function(data,template)
    {
        return moment().format(this.args);
    }
});