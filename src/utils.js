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
        console.log('throwing');
        console.log(error,output);

        return output;
    },

    CompileError: CompileError
};