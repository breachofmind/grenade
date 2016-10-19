var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@include', function()
{
    it('should include the partial', function(done)
    {
        var promises = [
            compile("@include(test/partial)")
        ];
        var check = result => { expect(result).to.equal("included"); };
        testkit.map(promises,check,done);
    })
});