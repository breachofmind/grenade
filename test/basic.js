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
        template()
            .then((result)=>{ expect(result).to.equal(EMPTY) });
        template({})
            .then((result)=>{ expect(result).to.equal(EMPTY) });
        template(sample)
            .then((result)=>{ expect(result).to.equal(EMPTY) });
    });

    it('should return same string if no tags are present', function(){
        var string = "just a string";
        var template = compiler.compile(string);
        template()
            .then((result)=>{ expect(result).to.equal(string) });
        template({})
            .then((result)=>{ expect(result).to.equal(string) });
        template(sample)
            .then((result)=>{ expect(result).to.equal(string) });
    })
});

describe('variables', function()
{

    it('should resolve escaped variable, non-html', function(done)
    {
        var string = sample.test;
        var promises = [
            compile("${data.test}"),
            compile("${ data.test }"),
            compile("${data.test  }  ")
        ];
        var check = result => { return expect(result).to.equal(string) };
        testkit.map(promises, check, done);
    });

    it('should resolve escaped variable, non-html, multiple', function(done)
    {
        var promises = [
            compile("${data.test}${data.comment}"),
        ];
        var check = result => { expect(result).to.equal(sample.test + sample.comment) };
        testkit.map(promises,check,done);
    });

    it('should resolve raw variable, non-html', function(done)
    {
        var string = sample.test;
        var promises = [
            compile("${=data.test}"),
            compile("${ =data.test }"),
            compile("${ = data.test  }  ")
        ];
        var check = result => { expect(result).to.equal(string); };
        testkit.map(promises,check,done);
    });

    it('should resolve escaped variable html', function(done)
    {
        var string = grenade.Filter.apply('escape', sample.html);
        var promises = [
            compile("${data.html}"),
            compile("${ data.html }"),
            compile("${  data.html  }  ")
        ];
        var check = result => { expect(result).to.equal(string); };
        testkit.map(promises,check,done);
    });

    it('should resolve raw variable html', function(done)
    {
        var string = sample.html;
        var promises = [
            compile("${=data.html}"),
            compile("${=data.html }"),
            compile("${ = data.html }"),
            compile("${ =  data.html   } ")
        ];
        var check = result => { expect(result).to.equal(string); };
        testkit.map(promises,check,done);
    });

    it('should resolve to the literal string', function(done)
    {
        var promises = [
            compile("${:data.test}"),
        ];
        var check = result => { expect(result).to.equal("${data.test}"); };
        testkit.map(promises,check,done);
    });

    it('should resolve comment as empty string', function(done)
    {
        var promises = [
            compile("${#data.comment}"),
            compile("${#This is a comment}"),
            compile("${#  This is a comment }"),
            compile("${  # This is a comment }  ")
        ];
        var check = result => { expect(result).to.equal(EMPTY); };
        testkit.map(promises,check,done);
    });

    it('should return numbers as a string, including zero', function(done)
    {
        compile("${data.zero}${data.one}")
            .then((result) => {
                expect(result).to.equal("01");
            })
            .catch(e => { return e;}).then(e => { done(e) })
    })
});

describe('functions', function()
{
    it('should call a function', function(done)
    {
        compile("${data.func()}")
            .then((result) => {
                expect(result).to.equal("called");
            })
            .catch(e => { return e;}).then(e => { done(e) })
    });

    it('should call a function with arguments', function(done)
    {
        compile("${data.add(1,2)}")
            .then((result) => {
                expect(result).to.equal("3");
            })
            .catch(e => { return e;}).then(e => { done(e) })
    })
});