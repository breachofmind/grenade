"use strict";

module.exports = {

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