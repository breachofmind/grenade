var Filter = require('../Filter');
var moment = require('moment');

Filter.extend('fromNow', function(value,data) {
    if (value instanceof Date) {
        return moment(value).fromNow();
    }
    throw new Error(`"${value}" not an instance of Date for 'fromNow' filter`);
});