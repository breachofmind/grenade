var Compiler = require('./src/compiler');
var Template = require('./src/template');
var Tag      = require('./src/tag');


module.exports = {

    /**
     * Compiler class.
     * @type Compiler
     */
    Compiler: Compiler,

    /**
     * Tag class.
     * @type Tag
     */
    Tag: Tag,

    /**
     * Template class.
     * @type Template
     */
    Template: Template,

    /**
     * Alias to load function.
     * @param name
     * @param opts
     * @param callback
     * @returns {*}
     */
    load: function(name,opts,callback)
    {
        return Compiler.load(name,opts,callback);
    },

    /**
     * Alias to compiler function.
     * @param opts object
     * @param string
     * @returns {Function}
     */
    compile: function(opts,string)
    {
        if (arguments.length == 1) {
            string = arguments[0];
            opts = {};
        }
        var compiler = new Compiler(opts);

        return compiler.compile(string);
    }
};