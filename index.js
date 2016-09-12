var Compiler = require('./src/compiler');
var Template = require('./src/template');
var Tag      = require('./src/tag');

require('./src/tags/extends');
require('./src/tags/foreach');
require('./src/tags/if');
require('./src/tags/include');
require('./src/tags/section');
require('./src/tags/unless');
require('./src/tags/yield');

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
        return new Compiler(opts).load(name,callback);
    },

    /**
     * Alias to compiler function.
     * @param string
     * @param opts object
     * @returns {Function}
     */
    compile: function(string,opts)
    {
        return new Compiler(opts).compile(string);
    },

    /**
     * Alias to precompiler.
     * @param string
     * @param opts object
     * @returns {Function}
     */
    precompile: function(string,opts)
    {
        return new Compiler(opts).precompile(string);
    }
};