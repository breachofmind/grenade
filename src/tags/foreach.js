var _ = require('lodash');
var Tag = require('../tag');
var utils = require('../utils');

/**
 * A loop structure.
 * Loops through the given array of data and render the given scope.
 */
Tag.extend('foreach', {

    block: true,

    parse: function(args) {
        var index,key,array;
        var parts = args.trim().split(" in ",2);
        array = parts[1];
        key = parts[0];

        // If the first character is parenthesis...
        if (parts[0][0] == "(") {
            var tracking = parts[0].replace(/[\(|\)]/g,"").split(",",2);
            index = tracking[0];
            key = tracking[1];
        }
        return {key: key, array: array, index:index}
    },

    render: function(data) {
        var out = "";
        var array = this.template.value(data, this.args.array) || [];

        var $parent = _.clone(data);
        for (var i= 0, len=array.length; i<len; i++) {
            var copy = {
                $parent: $parent
            };
            copy[this.args.key] = array[i];
            if (this.args.index) copy[this.args.index] = i;

            out += this.scope.render(copy);
        }
        return out;
    }
});