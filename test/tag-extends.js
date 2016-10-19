var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@extends', function(){
    it('should extend from a parent layout', function(done){

        var promises = [
            compile(_extend('content')),
        ];
        var check = result => { expect(result).to.equal("layout!"); };
        testkit.map(promises,check,done);
    });

    it('should return nothing if no section to yield', function(done){
        var promises = [
            compile(_extend('nothing')),
        ];
        var check = result => { expect(result).to.equal(EMPTY); };
        testkit.map(promises,check,done);
    })
});

function _extend(v)
{
    return `
    @extends(test/layout)

    @section(${v})
    layout!
    @endsection
    `
}