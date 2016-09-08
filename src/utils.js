"use strict";

module.exports = {

    RX_VARS: /(\$\{.*?\})/gm,
    RX_VAR: /\$\{(.*?)\}/,
    RX_TAGS: /\s*?(\@.*[^\s+])/gm,
    RX_TAG: /\@((\w+)\((.*)\)|(\w+))/,

    MODE_RAW: "=",
    MODE_COMMENT: "#",

    parseVar:function(property)
    {
        property = property.replace("${", "");
        property = property.substr(0, property.length-1);

        var chr = property[0];
        var mode = chr == "=" || chr == "#" ? chr : null;
        if (mode) {
            property = property.replace(chr,"");
        }
        var filters = property.split(" | ",2);
        var func = property.indexOf("(") > -1 && property.indexOf(")") > -1;
        var args = null;
        if(func) {
            args = property.slice(property.indexOf("(")+1, property.length-1);
            property = property.substr(0,property.indexOf("("));
        }
        return {
            mode: mode,
            property: mode ? property.replace(chr,"") : property,
            args:"",
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