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

    DELIM_JAVASCRIPT: /\$\{\s*([^\}]+\}?)\}/gm,
    DELIM_HANDLEBARS: /\{\{\s*(.*?[^\{\}\s]+)\s*\}\}/gm,

    /**
     * Given the regex, find matches in the input and call a function.
     * Returns the index of the last match.
     * @param rx RegEx
     * @param input string
     * @param callback function
     * @returns {number}
     */
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

    noop: function() {},

    /**
     * Rethrow any exceptions from rendering.
     * @param error object
     * @param output string
     * @returns {string}
     */
    rethrow: function(error,output)
    {
        var message = `[${error.name}] - ${error.message}`;

        return message+" \n"+output+"...!!!";
    },

    /**
     * Parses the @foreach arguments into usuable components.
     * @param args string
     * @returns {{key: *, array: *, index: string}}
     */
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

    /**
     * Helper for appending to the output.
     * @param what string
     * @returns {string}
     */
    append: function(what)
    {
        return `__out.push(${what});`;
    },

    resolve: function(what)
    {
        return `__out.push( new Promise(resolve,reject) { try { ${what} } catch(e) { reject(e) } })`;
    },

    CompileError: CompileError
};