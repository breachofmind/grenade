"use strict";

var Compiler = require('./src/compiler');
var Template = require('./src/template');
var Filter   = require('./src/filter');
var Tag      = require('./src/tag');

require('./src/filters/escape');
require('./src/filters/class');
require('./src/filters/text-transforms');

require('./src/tags/extends');
require('./src/tags/yield');
require('./src/tags/include');
require('./src/tags/section');
require('./src/tags/if');
require('./src/tags/unless');
require('./src/tags/else');
require('./src/tags/elseif');
require('./src/tags/foreach');
require('./src/tags/for');
require('./src/tags/verbatim');
require('./src/tags/push');
require('./src/tags/stack');



module.exports = new(function Grenade(){

    this.Compiler = Compiler;

    this.Template = Template;

    this.Filter = Filter;

    this.Tag = Tag;

    /**
     * Load a file and return a rendering function.
     * @param filename string
     * @param opts object
     * @param done function
     * @returns {Function}
     */
    this.load = function(filename, opts, done)
    {
        var compiler = new Compiler(opts);

        return compiler.load(filename,done);
    };

    /**
     * Return an engine function for express.
     * @param opts
     * @returns {Function}
     */
    this.express = function(opts)
    {
        opts.express = true;
        var compiler = new Compiler(opts);

        return function(filename, options, done)
        {
            compiler.load(filename, function(err,template) {
                if (err) {
                    return done(new Error(err), null);
                }
                return done(null,template(options));
            })
        }
    }

})();