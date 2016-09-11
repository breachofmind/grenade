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

        this.prettyPrintOptions = opts.prettyPrintOptions || {
                index:2,
                max_preserve_newlines: 0
            };

        this.template = null;
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
     * @returns {function}
     */
    compile(string)
    {
        ok (typeof string == "string", "A string is required.");

        var compiler = this;

        this.log("Compiling template");
        this.template = new Template(string,null,this);
        this.log("Compiling complete");

        return function(data) {
            var output = compiler.template.render(data);
            compiler.log("Template rendered");
            return compiler.prettyPrint ? beautify(output, compiler.prettyPrintOptions) : output;
        };
    }

    /**
     * Precompile string.
     * @param string string
     * @returns {*}
     */
    precompile(string)
    {
        this.template = new Template(string,null,this);

        return `module.exports = function(data){ return ${this.template.source}; }`;
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
     * Load a new file.
     * @param filename string
     * @param opts object
     * @param done function
     */
    static load(filename,opts,done)
    {
        var compiler = new Compiler(opts);

        if (! opts.express) {
            filename = compiler.filepath(filename);
        }
        fs.readFile(filename, function(err,contents) {
            if (err) {
                return done(new Error(err), null);
            }
            return done(null, compiler.compile(contents.toString()))

        }.bind(this))
    }

    /**
     * Generate a function for the express engine.
     * @param opts object
     * @returns {Function}
     */
    static express(opts)
    {
        opts.express = true;
        return function(filepath,options,done)
        {
            return Compiler.load(filepath, opts, function(err, template) {
                return done(err, template(options));
            })
        }
    }
}

module.exports = Compiler;