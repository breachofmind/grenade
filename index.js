var Compiler = require('./src/compiler');
var Tag = require('./src/tag');
var Template = require('./src/template');

module.exports = {
    Compiler: Compiler,
    Tag: Tag,
    Template: Template,

    load: function(name,opts,callback)
    {
        return Compiler.load(name,opts,callback);
    },

    compile: function(string)
    {
        var opts = {};
        if (arguments.length > 1) {
            string = arguments[1];
            opts = arguments[0];
        }
        var compiler = new Compiler(opts);

        return compiler.compile(string);
    }
};