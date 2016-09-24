"use strict";

var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var grenade  = testkit.grenade;
var sample   = testkit.sampleData;
var fs       = require('fs');
var path     = require('path');
var _        = require('lodash');

const EMPTY = "";


describe('configuration', function()
{
    it('should be an object', function(){
        expect(grenade).to.be.a('object');
        expect(compiler).to.be.an.instanceof(grenade.Compiler);
    });
    it('should have class instances to extensions', function(){
        expect(grenade.Compiler).to.not.equal(undefined);
        expect(grenade.Tag).to.not.equal(undefined);
        expect(grenade.Filter).to.not.equal(undefined);
        expect(grenade.Template).to.not.equal(undefined);
    })

    it('should set a root path', function(){
        expect(compiler.rootPath).to.equal(path.normalize(testkit.options.rootPath));
    });
    it('should have correct extension', function(){
        expect(compiler.extension).to.equal(testkit.options.extension);
    });
    it('should create the correct filepath', function(){
        expect(compiler.path('content')).to.equal(compiler.rootPath + "content." + testkit.options.extension);
        expect(compiler.path('layout/content')).to.equal(compiler.rootPath + "layout/content." + testkit.options.extension);
    });
});

describe('basic strings', function()
{
    it('should throw error if no arguments given', function(){
        expect(compiler.template).to.throw('A string is required');
    });

    it('should return empty string if given empty string', function(){
        var template = compiler.compile(EMPTY);
        expect( template({}) ).to.equal(EMPTY);
        expect( template() ).to.equal(EMPTY);
        expect( template(sample) ).to.equal(EMPTY);
    });

    it('should return same string if no tags are present', function(){
        var template = compiler.compile('just a string');
        expect( template() ).to.equal('just a string');
        expect( template({}) ).to.equal('just a string');
        expect( template(sample) ).to.equal('just a string');
    })
});

describe('variables', function()
{

    it('should resolve escaped variable, non-html', function(){
        var string = sample.test;
        expect(compile("${data.test}")).to.equal(string);
        expect(compile("${ data.test }")).to.equal(string);
        expect(compile("${data.test  }  ")).to.equal(string);
        expect(compile("${data.test}${data.comment}")).to.equal(sample.test + sample.comment);
        expect(compile("${data.test} ${data.comment}")).to.equal(sample.test + " " +sample.comment);
    });
    it('should resolve raw variable, non-html', function(){
        var string = sample.test;
        expect(compile("${=data.test}")).to.equal(string);
        expect(compile("${ =data.test }")).to.equal(string);
        expect(compile("${ = data.test  }  ")).to.equal(string);
    });
    it('should resolve escaped variable html', function(){
        var string = grenade.Filter.apply('escape', sample.html);
        expect(compile("${data.html}")).to.equal(string);
        expect(compile("${ data.html }")).to.equal(string);
        expect(compile("${ data.html }  ")).to.equal(string);
    });
    it('should resolve raw variable html', function(){
        var string = sample.html;
        expect(compile("${=data.html}")).to.equal(string);
        expect(compile("${=data.html }")).to.equal(string);
        expect(compile("${ = data.html }")).to.equal(string);
        expect(compile("${ =  data.html   } ")).to.equal(string);
    });
    it('should resolve comment as empty string', function(){
        expect(compile("${#data.comment}")).to.equal(EMPTY);
        expect(compile("${#This is a comment}")).to.equal(EMPTY);
        expect(compile("${#  This is a comment }")).to.equal(EMPTY);
        expect(compile("${  # This is a comment }  ")).to.equal(EMPTY);
    });
    it('should return numbers as a string, including zero', function(){
        expect(compile("${data.zero}${data.one}")).to.equal("01");
    })
});

describe('functions', function(){
    it('should call a function', function(){
        expect(compile("${data.func()}")).to.equal("called");
    });
    it('should call a function with arguments', function(){
        expect(compile("${data.add(1,2)}")).to.equal("3");
    })
});