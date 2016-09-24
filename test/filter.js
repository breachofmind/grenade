var testkit  = require('../src/support/testing');
var compile  = testkit.compile;
var sample   = testkit.sampleData;
var Filter   = testkit.grenade.Filter;

describe('filters', function(){

    it('should apply a filter', function(){
        var expected = sample.test.toUpperCase();
        expect(compile("${data.test | toUpper}")).to.equal(expected);
        expect(compile("${data.test | toUpper }")).to.equal(expected);
        expect(compile("${=data.test  | toUpper}")).to.equal(expected);
    });
    it('should apply multiple filters', function(){
        var expected  = Filter.apply('slug', sample.test).toUpperCase();
        expect(compile("${data.test | slug,toUpper}")).to.equal(expected);
        expect(compile("${data.test | slug,toUpper }")).to.equal(expected);
        expect(compile("${=data.test  | slug,toUpper}")).to.equal(expected);
    });

});