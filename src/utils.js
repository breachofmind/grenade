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
            if (m) out.push(m);
        } while (m);
        return out;
    }
};