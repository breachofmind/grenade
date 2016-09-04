var nade     = require('../index');
var chai     = require('chai');
var expect   = chai.expect;
var should   = chai.should();
var fs       = require('fs');
var path     = require('path');


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

describe('compilation', function(){

});