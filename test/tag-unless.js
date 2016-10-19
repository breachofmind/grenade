var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@unless @else', function(){


    it('should return the element if expression is false', function(done)
    {
        var promises = [
            compile(_unless("false")),
            compile(_unless("! true")),
            compile(_unless("1 === 2")),
            compile(_unless("1 !== 1")),
            compile(_unless("'a' == 'z'")),
            compile(_unless("data.test == data.html")),
        ];
        var check = result => { expect(result).to.equal("yes"); };
        testkit.map(promises,check,done);
    });

    it('should not return the element if expression is true', function(done)
    {
        var promises = [
            compile(_unless("true")),
            compile(_unless("! false")),
            compile(_unless("5>1")),
        ];
        var check = result => { expect(result).to.equal(EMPTY); };
        testkit.map(promises,check,done);
    });

    it('should return true portion of unless/else if expression is false', function(done)
    {
        var promises = [
            compile(_unlesselse("true")),
            compile(_unlesselse("! false")),
            compile(_unlesselse("1 === 1")),
            compile(_unlesselse("1 !== 2")),
            compile(_unlesselse("'x' == 'x'")),
        ];
        var check = result => { expect(result).to.equal('no'); };
        testkit.map(promises,check,done);
    });

    it('should return false portion of unless/else if expression is true', function(done)
    {
        var promises = [
            compile(_unlesselse("false")),
            compile(_unlesselse("! true")),
            compile(_unlesselse("1 !== 1")),
            compile(_unlesselse("1 === 2")),
            compile(_unlesselse("'a' == 'z'")),
        ];
        var check = result => { expect(result).to.equal('yes'); };
        testkit.map(promises,check,done);
    });
});

function _unless(v)
{
    return `
        @unless(${v})
        yes
        @endunless
        `;
}

function _unlesselse(v)
{
    return `
        @unless(${v})
        yes
        @else
        no
        @endunless
        `
}