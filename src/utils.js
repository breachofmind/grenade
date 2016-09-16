"use strict";

class CompileError extends Error
{
    constructor(message, template)
    {
        var section = template.input.substr(template.start,100) + "...";
        super();
        this.message = message + `
        ${section}
        `;
    }
}

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

    rethrow: function(error,output)
    {
        var message = `[${error.name}] - ${error.message}`;

        return message+" \n"+output+"...!!!";
    },

    parseForEach: function(args)
    {
        var parts = args.trim().split(" in ",2);
        var array = parts[1];
        var key = parts[0];
        var index = "i";

        // If the first character is parenthesis...
        if (parts[0][0] == "[") {
            var tracking = parts[0].replace(/[\[|\]]/g,"").split(",",2);
            index = tracking[0];
            key = tracking[1];
        }
        return {key: key, array: array, index:index}
    },

    CompileError: CompileError
};