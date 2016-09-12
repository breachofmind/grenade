var Compiler = require('./src/compiler');
var Template = require('./src/template');
var Filter   = require('./src/filter');
var Tag      = require('./src/tag');

require('./src/tags/extends');
require('./src/tags/foreach');
require('./src/tags/if');
require('./src/tags/include');
require('./src/tags/section');
require('./src/tags/unless');
require('./src/tags/yield');
require('./src/tags/show');

module.exports = {

    /**
     * Compiler class.
     * @type Compiler
     */
    Compiler: Compiler,

    /**
     * Tag Factory class.
     * @type TagFactory
     */
    Tag: Tag,

    /**
     * Filter Factory class.
     * @type FilterFactory
     */
    Filter: Filter,

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
    },

    /**
     * Return an engine function for express.
     * @param opts object
     * @returns {Function}
     */
    express: function(opts)
    {
        var compiler = new Compiler(opts);
        return function(filepath,options,done)
        {
            return compiler.load(filepath, function(err, template) {
                return done(err, template(options));
            })
        }
    }
};