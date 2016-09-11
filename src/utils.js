"use strict";

module.exports = {

    /**
     * Split an array in two, at the given index.
     * Do not include the split value.
     * @param array
     * @param index number
     * @returns {*[]}
     */
    splitAt: function(array,index)
    {
        var left = [], right = [];
        for (var i=0; i<array.length; i++) {
            if (i<index) left.push(array[i]);
            if (i>index) right.push(array[i]);
        }
        return [left,right];
    },

    /**
     * Replaces a part of a string, which should be faster than string.replace().
     * @param string string
     * @param start number
     * @param end number
     * @param what string
     * @returns {*}
     */
    replaceAt: function(string,start,end,what)
    {
        return string.substring(0, start) + what + string.substring(end);
    }
};