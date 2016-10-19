var testkit  = require('../src/support/testing');
var compile  = testkit.compile;
var sample   = testkit.sampleData;
var Filter   = testkit.grenade.Filter;

describe('filters', function(){

    it('should apply a filter', function(done){
        var expected = sample.test.toUpperCase();

        var promises = [
            compile("${data.test | toUpper}"),
            compile("${data.test | toUpper }"),
            compile("${=data.test  | toUpper}"),
        ];
        var check = result => { expect(result).to.equal(expected); };
        testkit.map(promises,check,done);
    });
    it('should apply multiple filters', function(done)
    {
        var expected  = Filter.apply('slug', sample.test).toUpperCase();
        var promises = [
            compile("${data.test | slug,toUpper}"),
            compile("${data.test | slug,toUpper }"),
            compile("${=data.test  | slug,toUpper}"),
        ];
        var check = result => { expect(result).to.equal(expected); };
        testkit.map(promises,check,done);
    });

});