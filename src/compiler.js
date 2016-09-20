"use strict";

var fs       = require('fs');
var path     = require('path');
var assert   = require('assert');
var utils    = require('./utils');
var Template = require('./template');
var beautify = require('js-beautify').html;
var pkg      = require('../package.json');

class Compiler
{
    constructor(opts)
    {
        if (! opts) opts = {};

        this.version = pkg.version;

        /**
         * The root views path.
         * @type {string}
         */
        this.rootPath = path.normalize(opts.rootPath || "./");

        /**
         * The file extension.
         * @type {string}
         */
        this.extension = opts.extension || "htm";

        /**
         * Pretty print the output html?
         * @type {boolean}
         */
        this.prettyPrint = opts.prettyPrint || false;

        /**
         * Pretty print options, for JS beautify.
         * @type {{}}
         */
        this.prettyPrintOptions = opts.prettyPrintOptions ||
            {
                index:2,
                max_preserve_newlines: 0
            };


        /**
         * The local data object name.
         * @type {string}
         */
        this.localsName = opts.localsName || 'data';

        /**
         * Using express?
         * @type {boolean}
         */
        this.express = opts.express || false;

        /**
         * Limiter for variables.
         * @type {RegExp}
         */
        this.delimiter = opts.delimiter || utils.DELIM_JAVASCRIPT;

        /**
         * Enable template caching?
         * Disable if developing locally.
         * @type {boolean}
         */
        this.enableCache = opts.enableCache || true;


        /**
         * The cache object.
         * filename: Template
         * @type {{}}
         */
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
        return this.renderer( this.template(string,parent) );
    }

    /**
     * Compile a string into a template.
     * @param string
     * @param parent Template optional
     * @param scope Compiler|TemplateTag
     * @returns {Template}
     */
    template(string,parent,scope)
    {
        assert.ok(typeof string == 'string', "A string is required");

        if (! scope) scope = this;

        return new Template(string, parent||null, scope);
    }

    /**
     * Make a template out of the given filename synchronously.
     * @param filename string
     * @param parent Template
     * @param scope Template|TemplateTag|Compiler
     * @returns {Template}
     */
    make(filename,parent,scope)
    {
        var cached = this.cached(filename);
        if (cached) {
            return this.template(cached.input, parent, scope);
        }

        var contents = fs.readFileSync(this.path(filename), {encoding:"utf8"});

        var template = this.template(contents.toString(), parent, scope);

        return this.cached(filename, template);
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
            if (this.enableCache && this.cache.hasOwnProperty(filename)) {
                return this.cache[filename];
            }
            return null;
        }
        if (this.enableCache) this.cache[filename] = template;

        return template;
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
            return done(null, this.renderer(cached));
        }

        fs.readFile(this.express ? filename : this.path(filename), function(err,contents) {

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
