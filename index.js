"use strict";

var Compiler = require('./src/compiler');
var Template = require('./src/template');
var Filter   = require('./src/filter');

require('./src/filters/escape');
require('./src/filters/text-transforms');

require('./src/tags/extends');
require('./src/tags/yield');
require('./src/tags/include');
require('./src/tags/section');
require('./src/tags/if');
require('./src/tags/else');
require('./src/tags/elseif');
require('./src/tags/foreach');
require('./src/tags/for');



module.exports = new(function Grenade(){

    this.Compiler = Compiler;

    this.Template = Template;

    this.Filter = Filter;

    this.load = function(filename, opts, done)
    {
        var compiler = new Compiler(opts);

        return compiler.load(filename,done);
    }

})();