"use strict";

module.exports = {

    matches: function(rx,input,callback)
    {
        var index = 0;
        var match;

        while((match = rx.exec(input))) {
            callback(match,index);
            index = match.index + match[0].length;
        }
        return index;
    },

};