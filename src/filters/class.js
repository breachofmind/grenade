var Filter = require('../Filter');

var opts = {
    prefix:"?",
    pushPrefix: false,
    transform:function(text) {
        return "{"+text+"}";
    }
};

/**
 * Return the object key names, if the values are truthy.
 * Useful for doing conditional classes.
 * @example ${?{display:true, nodisplay:false}}
 */
Filter.extend('class', opts, function(value,data) {
    if (typeof value != "object") {
        return value;
    }
    var out = [];
    Object.keys(value).forEach(function(key) {
        if (value[key]) {
            out.push(key);
        }
    });
    return out.join(" ");
});