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
     * @param string
     * @param opts object
     * @returns {Function}
     */
    compile: function(string,opts)
    {
        var compiler = new Compiler(opts);

        return compiler.compile(string);
    },

    /**
     * Alias to precompiler.
     * @param string
     * @param opts object
     * @returns {Function}
     */
    precompile: function(string,opts)
    {
        var compiler = new Compiler(opts);

        return compiler.precompile(string);
    }
};