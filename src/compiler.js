"use strict";
var ok = require('assert').ok;
var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').html;
var Template = require('./template');
var setup = require('./tags');

class Compiler
{
    constructor(opts)
    {
        opts = opts || {};

        this.extension = opts.extension || "htm";

        this.rootPath = opts.rootPath || "./";

        this.prettyPrint = opts.prettyPrint || false;

        this.template = null;
        this.tags = [];
        this.vars = [];
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

        setup(this);

        this.template = new Template(string,null,this);

        return function(data) {
            var output = this.template.render(data);
            return this.prettyPrint ? beautify(output, this.prettyPrint) : output;

        }.bind(this);
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