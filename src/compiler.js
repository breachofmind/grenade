"use strict";
var ok = require('assert').ok;
var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').html;
var Template = require('./template');


class Compiler
{
    constructor(opts)
    {
        opts = opts || {};

        this.start = Date.now();

        this.debug = opts.debug || false;

        this.extension = opts.extension || "htm";

        this.rootPath = path.normalize(opts.rootPath || "./");

        this.prettyPrint = opts.prettyPrint || false;

        this.isExpress = opts.express || false;

        this.prettyPrintOptions = opts.prettyPrintOptions || {
                index:2,
                max_preserve_newlines: 0
            };

        // Index of objects.
        this.cache = {};
        this.tags = [];
        this.vars = [];
    }

    log(message)
    {
        if (this.debug) {
            var elasped = Date.now() - this.start;
            arguments[0] = `[debug] ${elasped}ms - ${arguments[0]}`;
            console.warn.apply(console, arguments);
        }
    }

    /**
     * Assemble a filename.
     * @param filename string
     * @returns {string}
     */
    filepath(filename)
    {
        return path.normalize(this.rootPath + filename + "." + this.extension);
    }

    /**
     * Compile a string to a template function.
     * @param string
     * @param parent Template
     * @returns {Function}
     */
    compile(string,parent)
    {
        ok (typeof string == "string", "A string is required.");

        return this.renderer( this.template(string,parent) ) ;
    }

    /**
     * Create a template from a string.
     * @param string
     * @param parent Template
     * @returns {Template}
     */
    template(string,parent)
    {
        ok (typeof string == "string", "A string is required.");

        return new Template(string, parent||null, this);
    }

    /**
     * Create a rendering function.
     * @param template Template
     * @returns {Function}
     */
    renderer(template)
    {
        var compiler = this;

        return function(data) {
            var output = template.render(data);
            return compiler.prettyPrint ? beautify(output, compiler.prettyPrintOptions) : output;
        }
    }

    /**
     * Precompile string. TODO
     * @param string string
     * @returns {*}
     */
    precompile(string)
    {
        var template = this.template(string,null);

        return `module.exports = function(data){ return ${template.source}; }`;
    }

    /**
     * Get the string contents of a file.
     * @param filename string
     * @returns {*}
     */
    contents(filename)
    {
        var filepath = this.filepath(filename);

        if (! fs.existsSync(filepath)) {
            throw new Error('File does not exist.');
        }
        return fs.readFileSync(filepath, {encoding:"utf8"});
    }

    /**
     * Make a template out of the given file name and parent Template.
     * Useful for calling from a tag.
     * @param filename string
     * @param parent Template
     * @returns {*}
     */
    make(filename, parent)
    {
        var filepath = this.filepath(filename);

        if (this.cache[filepath]) {
            this.log('Using cached: %s', filepath);
            return this.cache[filepath].clone(parent);
        }
        if (! fs.existsSync(filepath)) {
            throw new Error('File does not exist');
        }
        var template = this.template(fs.readFileSync(filepath, {encoding:"utf8"}), parent);

        this.cache[filepath] = template;

        return template;
    }


    /**
     * Load a new file.
     * @param filename string
     * @param done function
     */
    load(filename,done)
    {
        if (! this.isExpress) {
            filename = this.filepath(filename);
        }

        // Check if the template is in the cache already.
        if (this.cache[filename]) {
            this.log('Using cached: %s', filename);
            return done(null, this.renderer(cache[filename]));
        }

        fs.readFile(filename, function(err,contents) {
            if (err) {
                return done(new Error(err), null);
            }
            // Create a new template and cache it.
            var template = this.template(contents.toString());

            this.cache[filename] = template;

            return done(null, this.renderer(template));

        }.bind(this))
    }
}

module.exports = Compiler;