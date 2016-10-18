"use strict";

var fs       = require('fs');
var path     = require('path');
var assert   = require('assert');
var utils    = require('./support/utils');
var Template = require('./Template');
var beautify = require('js-beautify').html;
var pkg      = require('../package.json');

class Compiler
{
    constructor(opts)
    {
        /**
         * The root views path.
         * @type {string}
         */
        this.rootPath = "./";

        /**
         * The component path directory.
         * @type {string}
         */
        this.componentPath = './components';

        /**
         * The file extension.
         * @type {string}
         */
        this.extension = "htm";

        /**
         * Pretty print the output html?
         * @type {boolean}
         */
        this.prettyPrint = false;

        /**
         * Should we use promises?
         * Making false could vastly speed up rendering.
         * @type {boolean}
         */
        this.promises = true;

        /**
         * Pretty print options, for JS beautify.
         * @type {{}}
         */
        this.prettyPrintOptions = {
            index:2,
            max_preserve_newlines: 0
        };


        /**
         * The local data object name.
         * @type {string}
         */
        this.localsName = 'data';

        /**
         * Using express?
         * @type {boolean}
         */
        this.express = false;

        /**
         * Limiter for variables.
         * @type {RegExp}
         */
        this.delimiter = utils.DELIM_JAVASCRIPT;

        /**
         * Enable template caching?
         * Disable if developing locally.
         * @type {boolean}
         */
        this.enableCache = true;

        /**
         * The cache object.
         * filename: Template
         * @type {{}}
         * @private
         */
        this._cache = {};

        /**
         * Grenade version.
         * @type string
         * @private
         */
        this._version = pkg.version;

        this.setOptions(opts);
    }

    /**
     * Set the compiler options.
     * @param opts object
     * @returns Compiler
     */
    setOptions(opts)
    {
        if (! opts) opts = {};
        Object.keys(opts).forEach(function(key){
            if (this.hasOwnProperty(key) && typeof this[key] != 'function' && ! key.startsWith("_")) {
                this[key] = opts[key];
            }
        }.bind(this));
        this.rootPath = path.normalize(this.rootPath);
        this.componentPath = path.normalize(this.componentPath);

        return this;
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
            if (this.enableCache && this._cache.hasOwnProperty(filename)) {
                return this._cache[filename];
            }
            return null;
        }
        if (this.enableCache) this._cache[filename] = template;

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

            if (this.prettyPrint) {
                return this.promises ? output.then((results) => {
                    return beautify(results, this.prettyPrintOptions)
                }) : beautify(output, this.prettyPrintOptions);
            }
            return output;

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
