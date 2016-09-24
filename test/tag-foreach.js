var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@foreach', function()
{
    it('should return nothing if empty array given', function(){
        expect(compile(_foreach("item in data.arr"), {arr:[]})).to.equal(EMPTY);
        expect(compile(_foreach("item in data.arr"), {})).to.equal(EMPTY);
        expect(compile(_foreach("[i,item] in data.arr"), {})).to.equal(EMPTY);
    });
    it('should return each value if array given', function(){
        expect(compile(_foreach("item in data.arr")).replace(/\s/g,"")).to.equal("redgreenblue");
        expect(compile(_foreach("[i,item] in data.arr")).replace(/\s/g,"")).to.equal("redgreenblue");
    });
    it('should return each value if hash given', function(){
        expect(compile(_foreach("item in data.hash")).replace(/\s/g,"")).to.equal("k1k2k3");
        expect(compile(_foreach("[i,item] in data.hash")).replace(/\s/g,"")).to.equal("k1k2k3");
    });
    it('should return the increment variable', function(){
        expect(compile(_foreachIncrement("[i,item] in data.arr","i")).replace(/\s/g,"")).to.equal("012");
    });
    it('should return the key of a hash object', function(){
        expect(compile(_foreachIncrement("[key,val] in data.hash","key")).replace(/\s/g,"")).to.equal("key1key2key3");
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