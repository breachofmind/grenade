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
    var t0 = grenade.compile('');
    it('should return empty string if given empty string', function(){
        expect(t0({})).to.equal('');
        expect(t0()).to.equal('');
        expect(t0({test:'string'})).to.equal('');
    });

    var t1 = grenade.compile('just a string');
    it('should return same string if no tags are present', function(){
        expect(t1({})).to.equal('just a string');
        expect(t1()).to.equal('just a string');
        expect(t1({test:'string'})).to.equal('just a string');
    })
});

describe('variables', function()
{
    var o = {
        test:"output",
        html:"<p>output</p>",
        comment:"comment"
    };

    var tVarEscaped = grenade.compile("${test}");
    var tVarRaw = grenade.compile("${=test}");
    var tHtmlEscaped = grenade.compile("${html}");
    var tHtmlRaw = grenade.compile("${=html}");
    var tComment1 = grenade.compile("${#comment}");
    var tComment2 = grenade.compile("${#comment is a long string, with commas and stuff}");
    var t2Vars = grenade.compile("${test}${comment}");

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
    })

});