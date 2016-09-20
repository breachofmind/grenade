"use strict";

var Compiler = require('./src/compiler');
var Template = require('./src/template');
var Filter   = require('./src/filter');
var Tag      = require('./src/tag');
var utils    = require('./src/utils');

require('./src/filters/escape');
require('./src/filters/class');
require('./src/filters/text-transforms');
require('./src/filters/date');

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
require('./src/tags/date');
require('./src/tags/show');

exports.Compiler = Compiler;
exports.Template = Template;
exports.Filter   = Filter;
exports.Tag      = Tag;
exports.utils    = utils;

/**
 * Load a file and return a rendering function.
 * @param filename string
 * @param opts object
 * @param done function
 * @returns {Function}
 */
exports.load = function(filename,opts,done)
{
    var compiler = new Compiler(opts);

    return compiler.load(filename,done);
};

/**
 * Return an engine function for express.
 * @param app Express
 * @param opts object
 * @returns {Function}
 */
exports.express = function(app, opts)
{
    opts.express = true;

    var compiler = new Compiler(opts);

    var engine = function(filename, options, done)
    {
        compiler.load(filename, function(err,template) {
            if (err) {
                return done(new Error(err), null);
            }
            return done(null,template(options));
        })
    };

    return app.engine(opts.extension, engine)
};