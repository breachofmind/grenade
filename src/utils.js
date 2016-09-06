module.exports = {

    /**
     * Returns all matches in a string, given the regex.
     * @param rx
     * @param str
     * @returns {Array}
     */
    matches: function(rx,str)
    {
        var out = [];
        do {
            var m = rx.exec(str);
            if (m) {
                m.lastIndex = rx.lastIndex;
                out.push(m);
            }
        } while (m);
        return out;
    },

    eachMatch: function(rx,template,handler)
    {
        rx.lastIndex = 0;
        do {
            var m = rx.exec(template.input);
            if (m) {
                m.lastIndex = rx.lastIndex;
                handler(m);

                // Start over from the beginning, since the handler
                // will replace parts of the template string.
                rx.lastIndex = 0;
            }
        } while(m);
    },

    replaceAt: function(string,start,end,what)
    {
        return string.substring(0, start) + what + string.substring(end);
    }
};