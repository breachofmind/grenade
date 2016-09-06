var nade     = require('../index');
var chai     = require('chai');
var expect   = chai.expect;
var should   = chai.should();
var fs       = require('fs');
var path     = require('path');
var _        = require('lodash');


describe('configuration', function()
{
    it('should be a factory object', function(){
        expect(nade).to.be.a('object');
    });

    it('should set a root path', function(){
        var demoPath = __dirname+"/../demo/";
        expect(nade.getRootPath()).to.equal('./'); // Default path.
        nade.setRootPath(demoPath);
        expect(nade.getRootPath()).to.equal(path.normalize(demoPath));
    })
});

describe('basic strings', function()
{
    it('should throw error if no arguments given', function(){
        expect(nade.compile).to.throw('Argument error: A string is required');
    });
    var t0 = nade.compile('');
    it('should return empty string if given empty string', function(){
        expect(t0({})).to.equal('');
        expect(t0()).to.equal('');
        expect(t0({test:'string'})).to.equal('');
    });

    var t1 = nade.compile('just a string');
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

    var tVarEscaped = nade.compile("${test}");
    var tVarRaw = nade.compile("${=test}");
    var tHtmlEscaped = nade.compile("${html}");
    var tHtmlRaw = nade.compile("${=html}");
    var tComment1 = nade.compile("${#comment}");
    var tComment2 = nade.compile("${#comment is a long string, with commas and stuff}");
    var t2Vars = nade.compile("${test}${comment}");

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