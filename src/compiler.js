"use strict";

var fs       = require('fs');
var path     = require('path');
var assert   = require('assert');
var Template = require('./template');
var beautify = require('js-beautify').html;

class Compiler
{
    constructor(opts)
    {
        if (! opts) opts = {};

        this.rootPath = path.normalize(opts.rootPath) || "./";
        this.extension = opts.extension || "htm";
        this.prettyPrint = opts.prettyPrint || false;
        this.localsName = opts.localsName || 'data';

        this.prettyPrintOptions = opts.prettyPrintOptions ||
        {
            index:2,
            max_preserve_newlines: 0
        };

        this.cache = {};
    }

    /**
     * Compile a string into a rendering function.
     * @param string
     * @param parent Template optional
     * @returns {Function}
     */
    compile(string, parent)
    {
        return this.renderer(this.template(string,parent));
    }

    /**
     * Compile a string into a template.
     * @param string
     * @param parent Template optional
     * @returns {Template}
     */
    template(string,parent)
    {
        assert.ok(typeof string == 'string', "A string is required");

        return new Template(string, parent||null, this);
    }

    /**
     * Make a template out of the given filename synchronously.
     * @param filename string
     * @param parent Template
     * @returns {Template}
     */
    make(filename,parent)
    {
        var cached = this.cached(filename);
        if (cached) {
            return this.template(cached.input, parent);
        }

        var contents = fs.readFileSync(this.path(filename), {encoding:"utf8"});

        return this.cached(filename, this.template(contents.toString(), parent));
    }

    /**
     * Get a path to a file.
     * @param filename
     * @returns {string|XMLList|XML}
     */
    path(filename)
    {
        return path.normalize(this.rootPath + filename + "." + this.extension);
    }

    /**
     * Get a file from the cache.
     * @param filename
     * @param template
     * @returns {*}
     */
    cached(filename,template)
    {
        if (typeof template == 'undefined') {
            if (this.cache.hasOwnProperty(filename)) {
                return this.cache[filename];
            }
            return null;
        }
        return this.cache[filename] = template;
    }

    /**
     * Create a rendering function.
     * @param template Template
     * @returns {Function}
     */
    renderer(template)
    {
        return function(data)
        {
            var output = template.render(data);

            return this.prettyPrint ? beautify(output,this.prettyPrintOptions) : output;

        }.bind(this);
    }

    /**
     * Load a file and return a rendering function.
     * @param filename string
     * @param done function(err,template)
     * @returns {Function}
     */
    load(filename, done)
    {
        var cached = this.cached(filename);
        if (cached) {
            return this.renderer(cached);
        }

        fs.readFile(this.path(filename), function(err,contents) {

            if (err) {
                return done(new Error(err), null);
            }

            var template = this.template(contents.toString());

            this.cached(filename,template);

            return done(null, this.renderer(template));

        }.bind(this))
    }
}

module.exports = Compiler;
