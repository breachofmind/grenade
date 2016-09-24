var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@extends', function(){
    it('should extend from a parent layout', function(){
        expect(compile(_extend('content'))).to.equal('layout!');
    });

    it('should return nothing if no section to yield', function(){
        expect(compile(_extend('nothing'))).to.equal(EMPTY);
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