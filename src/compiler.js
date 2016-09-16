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
        this.rootPath = opts.rootPath || "./";
        this.extension = opts.extension || "htm";
        this.prettyPrint = opts.prettyPrint || false;

        this.prettyPrintOptions = opts.prettyPrintOptions ||
        {
            index:2,
            max_preserve_newlines: 0
        };

        this.cache = {};
    }

    /**
     * Compile a string into a Template object.
     * @param string
     * @param parent Template optional
     * @returns {Template}
     */
    compile(string, parent)
    {
        assert.ok(string, "A string is required");

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
            return new Template(cached.input, parent, this);
        }

        var contents = fs.readFileSync(this.path(filename), {encoding:"utf8"});

        var template = new Template(contents.toString(),parent,this);

        return this.cached(filename,template);
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

            var template = this.compile(contents.toString());

            this.cached(filename,template);

            return done(null, this.renderer(template));

        }.bind(this))
    }
}

module.exports = Compiler;
