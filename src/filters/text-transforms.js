var Filter = require('../Filter');

Filter.extend('toUpper', function(value,data) {
    return value.toUpperCase();
});

Filter.extend('toLower', function(value,data) {
    return value.toLowerCase();
});

Filter.extend('slug', function(value,data) {
    return value.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'')
});