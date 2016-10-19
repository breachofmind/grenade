var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";
const WHITESPACE = /\s/g;

describe('@foreach', function()
{
    it('should return nothing if empty array given', function(done)
    {
        var promises = [
            compile(_foreach("item in data.nothing")),
            compile(_foreach("item in data.arr"), {}),
            compile(_foreach("[i,item] in data.arr"), {})
        ];
        var check = result => { expect(result).to.equal(EMPTY); };
        testkit.map(promises,check,done);
    });

    it('should return each value if array given', function(done)
    {
        var promises = [
            compile(_foreach("item in data.arr")),
            compile(_foreach("[i,item] in data.arr"))
        ];
        var check = result => { expect(result.replace(WHITESPACE,EMPTY)).to.equal("redgreenblue"); };
        testkit.map(promises,check,done);
    });

    it('should return each value if hash given', function(done)
    {
        var promises = [
            compile(_foreach("item in data.hash")),
            compile(_foreach("[i,item] in data.hash"))
        ];
        var check = result => { expect(result.replace(WHITESPACE,EMPTY)).to.equal("k1k2k3"); };
        testkit.map(promises,check,done);
    });

    it('should return the increment variable', function(done)
    {
        var promises = [
            compile(_foreachIncrement("[i,item] in data.arr","i")),
        ];
        var check = result => { expect(result.replace(WHITESPACE,EMPTY)).to.equal("012"); };
        testkit.map(promises,check,done);
    });

    it('should return the key of a hash object', function(done)
    {
        var promises = [
            compile(_foreachIncrement("[key,val] in data.hash","key")),
        ];
        var check = result => { expect(result.replace(WHITESPACE,EMPTY)).to.equal("key1key2key3"); };
        testkit.map(promises,check,done);
    });
});

function _foreach(v)
{
    return `
        @foreach(${v})
        \${item}
        @endforeach
        `;
}
function _foreachIncrement(v,k)
{
    return `
        @foreach(${v})
        \$\{${k}\}
        @endforeach
        `;
}