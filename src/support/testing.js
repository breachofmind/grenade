var Promise     = require('bluebird');
GLOBAL.chai     = require('chai');
GLOBAL.expect   = chai.expect;
GLOBAL.should   = chai.should();

var grenade  = require('grenade');
var demopath = __dirname+"/../../demo/views/";

var options = {
    rootPath: demopath,
    extension:"htm"
};
exports.compiler = new grenade.Compiler(options);
exports.grenade = grenade;
exports.options = options;

exports.sampleData = {
    test:       "output",
    html:       "<p>output</p>",
    comment:    "comment",
    arr:        ['red','green','blue'],
    zero:       0,
    one:        1,
    hash: {
        key1: "k1",
        key2: "k2",
        key3: "k3",
    },
    func: function() {
        return "called"
    },
    add: function(arg1,arg2) {
        return arg1 + arg2;
    }
};

exports.compile = function (string,data) {
    if (!data) data = exports.sampleData;
    return exports.compiler.compile(string)(data);
};

exports.map = function(array,callback,done) {
    var called = false;
    Promise.each(array, callback)
        .catch(e => { done(e); called = true; })
        .finally(() => { if(!called) done(); })
};