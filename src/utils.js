"use strict";

module.exports = {

    RX_VARS: /(\$\{.*?\})/gm,
    RX_VAR: /\$\{(.*?)\}/,
    RX_TAGS: /\s*?(\@.*[^\s+])/gm,
    RX_TAG: /\@((\w+)\((.*)\)|(\w+))/,

    MODE_RAW: "=",
    MODE_COMMENT: "#",

    parseVar:function(property,index)
    {
        var chr = property[0];
        var mode = chr == "=" || chr == "#" ? chr : null;
        var filters = property.split(" | ",2);
        return {
            index: index,
            mode: mode,
            property: mode ? property.replace(chr,"") : property,
            filters: filters.length > 1 ? filters[1].split(",") : null
        }
    }
    ,

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