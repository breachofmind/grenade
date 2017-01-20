"use strict";

var Compiler  = require('./src/Compiler');
var Template  = require('./src/Template');
var Component = require('./src/Component');
var Filter    = require('./src/Filter');
var Tag       = require('./src/Tag');
var utils     = require('./src/support/utils');

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
require('./src/tags/with');
require('./src/tags/options');
require('./src/tags/component');
require('./src/tags/block');
require('./src/tags/set');

exports.Component = Component;
exports.Compiler  = Compiler;
exports.Template  = Template;
exports.Filter    = Filter;
exports.Tag       = Tag;
exports.utils     = utils;

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
exports.express = function(app, opts={})
{
    opts.express = true;

    let compiler = new Compiler(opts);

    function engine(filename, options, done)
    {
        compiler.load(filename, function(err,template) {
            if (err) {
                return done(new Error(err), null);
            }
            if (compiler.promises) {
                return template(options).then(results => { done(null, results) });
            }
            return done(null,template(options));
        })
    };

    return app.engine(opts.extension, engine)
};