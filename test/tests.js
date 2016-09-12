var grenade  = require('../index');
var chai     = require('chai');
var expect   = chai.expect;
var should   = chai.should();
var fs       = require('fs');
var path     = require('path');
var _        = require('lodash');

var demopath = __dirname+"/../demo/";
var compiler = new grenade.Compiler({
    rootPath: demopath
});

var o = {
    test:"output",
    html:"<p>output</p>",
    comment:"comment",
    arr:['red','green','blue'],
    zero:0,
    one:1,
    func: function() {
        return "called"
    },
    args: function(arg1,arg2)
    {
        return args1 + arg2;
    }
};

describe('configuration', function()
{
    it('should be an object', function(){
        expect(grenade).to.be.a('object');
        expect(compiler).to.be.an.instanceof(grenade.Compiler);
    });

    it('should set a root path', function(){
        expect(compiler.rootPath).to.equal(path.normalize(demopath));
    })
});

describe('basic strings', function()
{
    it('should throw error if no arguments given', function(){
        expect(compiler.compile).to.throw('A string is required.');
    });
    var t0 = compiler.compile('');
    it('should return empty string if given empty string', function(){
        expect(t0({})).to.equal('');
        expect(t0()).to.equal('');
        expect(t0({test:'string'})).to.equal('');
    });

    var t1 = compiler.compile('just a string');
    it('should return same string if no tags are present', function(){
        expect(t1({})).to.equal('just a string');
        expect(t1()).to.equal('just a string');
        expect(t1({test:'string'})).to.equal('just a string');
    })
});

describe('variables', function()
{
    var tVarEscaped = compiler.compile("${test}");
    var tVarRaw = compiler.compile("${=test}");
    var tHtmlEscaped = compiler.compile("${html}");
    var tHtmlRaw = compiler.compile("${=html}");
    var tComment1 = compiler.compile("${#comment}");
    var tComment2 = compiler.compile("${#comment is a long string, with commas and stuff}");
    var t2Vars = compiler.compile("${test}${comment}");
    var t3 = compiler.compile("${zero}${one}");

    it('should resolve escaped variable, non-html', function(){
        expect(tVarEscaped(o)).to.equal(o.test);
        expect(t2Vars(o)).to.equal(o.test + o.comment);
    });
    it('should resolve raw variable, non-html', function(){
        expect(tVarRaw(o)).to.equal(o.test)
    });
    it('should resolve escaped variable html', function(){
        expect(tHtmlEscaped(o)).to.equal(_.escape(o.html));
    });
    it('should resolve escaped variable html', function(){
        expect(tHtmlRaw(o)).to.equal(o.html);
    });
    it('should resolve comment as empty string', function(){
        expect(tComment1(o)).to.equal("");
        expect(tComment2(o)).to.equal("");
    });
    it('should return numbers as a string, including zero', function(){
        expect(t3(o)).to.equal("01");
    })
});

describe('if/else', function()
{
    function src(v)
    {
        return `
        @if(${v})
        yes
        @endif
        `;
    }

    function ifelse(v)
    {
        return `
        @if(${v})
        yes
        @else
        no
        @endif
        `
    }
    var t0 = compiler.compile(src('true'));
    var t02 = compiler.compile(src('1 == 1'));
    var t1 = compiler.compile(src('false'));
    var t12 = compiler.compile(src('2 == 1'));
    var t2 = compiler.compile(ifelse('true'));
    var t3 = compiler.compile(ifelse('false'));

    it('should return the element if expression is true', function(){
        expect(t0({})).to.equal("yes");
        expect(t02(o)).to.equal("yes");
    });
    it('should not return the element if expression is false', function(){
        expect(t1({})).to.equal("");
        expect(t12(o)).to.equal("");
    });
    it('should return true portion of if/else if true', function(){
        expect(t2({})).to.equal("yes");
    });
    it('should return false portion of if/else if false', function(){
        expect(t3({})).to.equal("no");
    });
});

describe('foreach', function()
{
    var t0 = compiler.compile(`
        @foreach(item in arr)
        \${item}
        @endforeach
    `);
    it('should return nothing if empty array given', function(){
        expect(t0({})).to.equal("");
        expect(t0({arr:[]})).to.equal("");
    });
    it('should return each value if array given', function(){
        expect(t0(o)).to.equal("redgreenblue");
    });
});