var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@if @else', function()
{
    it('should return the element if expression is true', function(){
        expect(compile(_if("true"))).to.equal('yes');
        expect(compile(_if("! false"))).to.equal('yes');
        expect(compile(_if("1 === 1"))).to.equal('yes');
        expect(compile(_if("1 < 2"))).to.equal('yes');
        expect(compile(_if("2 <= 2"))).to.equal('yes');
        expect(compile(_if("1 !== 2"))).to.equal('yes');
        expect(compile(_if("'x' == 'x'"))).to.equal('yes');
    });
    it('should not return the element if expression is false', function(){
        expect(compile(_if("false"))).to.equal(EMPTY);
        expect(compile(_if("! true"))).to.equal(EMPTY);
        expect(compile(_if("1==2"))).to.equal(EMPTY);
    });
    it('should return true portion of if/else if true', function(){
        expect(compile(_ifelse("true"))).to.equal('yes');
        expect(compile(_ifelse("! false"))).to.equal('yes');
        expect(compile(_ifelse("1 === 1"))).to.equal('yes');
        expect(compile(_ifelse("1 !== 2"))).to.equal('yes');
        expect(compile(_ifelse("'x' == 'x'"))).to.equal('yes');
    });
    it('should return false portion of if/else if false', function(){
        expect(compile(_ifelse("false"))).to.equal('no');
        expect(compile(_ifelse("! true"))).to.equal('no');
        expect(compile(_ifelse("1==2"))).to.equal('no');
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