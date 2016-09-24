var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@include', function(){
    it('should include the partial', function(){
        expect(compile("@include(test/partial)")).to.equal('included');
    })
});