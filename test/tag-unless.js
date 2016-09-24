var testkit  = require('../src/support/testing');
var compiler = testkit.compiler;
var compile  = testkit.compile;
var sample   = testkit.sampleData;

const EMPTY = "";

describe('@unless @else', function(){


    it('should return the element if expression is false', function(){
        expect(compile(_unless("false"))).to.equal('yes');
        expect(compile(_unless("! true"))).to.equal('yes');
        expect(compile(_unless("1 === 2"))).to.equal('yes');
        expect(compile(_unless("1 !== 1"))).to.equal('yes');
        expect(compile(_unless("'x' == 'z'"))).to.equal('yes');
        expect(compile(_unless("data.test == data.html"))).to.equal('yes');
    });
    it('should not return the element if expression is true', function(){
        expect(compile(_unless("true"))).to.equal(EMPTY);
        expect(compile(_unless("! false"))).to.equal(EMPTY);
        expect(compile(_unless("5>1"))).to.equal(EMPTY);
    });
    it('should return true portion of unless/else if expression is false', function(){
        expect(compile(_unlesselse("true"))).to.equal('no');
        expect(compile(_unlesselse("! false"))).to.equal('no');
        expect(compile(_unlesselse("1 === 1"))).to.equal('no');
        expect(compile(_unlesselse("1 !== 2"))).to.equal('no');
        expect(compile(_unlesselse("'x' == 'x'"))).to.equal('no');
    });
    it('should return false portion of unless/else if expression is true', function(){
        expect(compile(_unlesselse("false"))).to.equal('yes');
        expect(compile(_unlesselse("! true"))).to.equal('yes');
        expect(compile(_unlesselse("1==2"))).to.equal('yes');
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