var _           = require('lodash');
var path        = require('path');
var fs          = require('fs');
var Template    = require('./src/template');
var Tag         = require('./src/tag');
var Data        = require('./src/data');
var base        = require('./src/base');

function Factory()
{
    var factory = this;
    var rootPath = "./";

    this.ext = "nade";

    /**
     * Set the root path.
     * @param dirname string
     * @returns {string}
     */
    this.setRootPath = function(dirname) {
        return rootPath = path.normalize(dirname);
    };

    /**
     * Gets the root path.
     * @returns {string}
     */
    this.getRootPath = function() {
        return rootPath;
    };

    /**
     * Compile the given string to a template function.
     * @param string
     * @returns {Function}
     */
    this.compile = function(string)
    {
        if (typeof string != 'string') {
            throw new Error('Argument error: A string is required');
        }
        var template = new Template(string);
        return function(object) {
            return template.render( new Data(object,null) );
        }
    };

    /**
     * Load a template from a file.
     * @param filename string
     * @returns {function}
     */
    this.load = function(filename)
    {
        return this.compile(this.fileGetContents(filename));
    };

    /**
     * Return a file contents.
     * @param filename string
     * @returns {*}
     */
    this.fileGetContents = function(filename)
    {
        var filepath = rootPath+filename+"."+this.ext;

        if (! fs.existsSync(filepath)) {
            throw new Error("File does not exist: "+filepath);
        }
        return fs.readFileSync(filepath, {encoding: "utf8"});
    };

    /**
     * A function to pass to the express engine.
     * @returns {Function}
     */
    this.express = function()
    {
        return function(filePath,options,callback)
        {
            fs.readFile(filePath,function(err,contents) {
                if (err) return callback(new Error(err),null);
                var template = factory.compile(contents);

                return callback(null, template(options));
            })
        };
    };

    base(this);
}

module.exports = new Factory();