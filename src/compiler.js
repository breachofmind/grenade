"use strict";
var ok = require('assert').ok;
var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').html;
var BaseTemplate = require('./template');
var BaseTags = require('./tags');

class Compiler
{
    constructor()
    {
        this.extension = "htm";

        this.rootPath = "./";

        this.prettyPrint = false;

        this.prettyPrintOpts = {
            indent_size:2,
            max_preserve_newlines:0
        };

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

        var Template = BaseTemplate(this);
        var Tag = BaseTags(this,Template);

        this.template = new Template(string,null);

        return function(data) {
            var output = this.template.render(data);
            return this.prettyPrint ? beautify(output, this.prettyPrintOpts) : output;

        }.bind(this);
    }

    /**
     * Load a new file.
     * @param filename string
     * @param done function
     */
    load(filename,done)
    {
        fs.readFile(filename, function(err,contents) {
            if (err) {
                return done(new Error(err), null);
            }

            return done(null, this.compile(contents.toString()))

        }.bind(this))
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
     * Get the express engine function.
     * @returns {Function}
     */
    get express()
    {
        var compiler = this;
        return function(filepath,options,done)
        {
            return compiler.load(filepath, function(err, template) {
                return done(err, template(options));
            })
        }
    }
}

module.exports = Compiler;