var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@if @else', function()
{
    it('should return the element if expression is true', function(done)
    {
        var promises = [
            compile(_if("true")),
            compile(_if("! false")),
            compile(_if("1 === 1")),
            compile(_if("1 < 2")),
            compile(_if("2 <= 2")),
            compile(_if("1 !== 2")),
            compile(_if("'x' == 'x'")),
        ];
        var check = result => { expect(result).to.equal("yes"); };
        testkit.map(promises,check,done);
    });

    it('should not return the element if expression is false', function(done)
    {
        var promises = [
            compile(_if("false")),
            compile(_if("! true")),
            compile(_if("1 === 2")),
        ];
        var check = result => { expect(result).to.equal(EMPTY); };
        testkit.map(promises,check,done);
    });

    it('should return true portion of if/else if true', function(done)
    {
        var promises = [
            compile(_ifelse("true")),
            compile(_ifelse("! false")),
            compile(_ifelse("1 === 1")),
            compile(_ifelse("1 !== 2")),
            compile(_ifelse("'x' == 'x'")),
        ];
        var check = result => { expect(result).to.equal("yes"); };
        testkit.map(promises,check,done);
    });

    it('should return false portion of if/else if false', function(done)
    {
        var promises = [
            compile(_ifelse("false")),
            compile(_ifelse("! true")),
            compile(_ifelse("1 === 2")),
        ];
        var check = result => { expect(result).to.equal("no"); };
        testkit.map(promises,check,done);
    });
});

function _if(v)
{
    return `
        @if(${v})
        yes
        @endif
        `;
}

function _ifelse(v)
{
    return `
        @if(${v})
        yes
        @else
        no
        @endif
        `
}