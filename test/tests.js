const EMPTY = "";

var grenade  = require('grenade');
var chai     = require('chai');
var expect   = chai.expect;
var should   = chai.should();
var fs       = require('fs');
var path     = require('path');
var _        = require('lodash');

var demopath = __dirname+"/../demo/";

var options = {
    rootPath: demopath,
    extension:"htm"
};
var compiler = new grenade.Compiler(options);

var sampleData = {
    test:"output",
    html:"<p>output</p>",
    comment:"comment",
    arr:['red','green','blue'],
    zero:0,
    one:1,
    hash: {
        key1: "k1",
        key2: "k2",
        key3: "k3",
    },
    func: function() {
        return "called"
    },
    add: function(arg1,arg2)
    {
        return arg1 + arg2;
    }
};
function compile(string,data) {
    if (!data) data = sampleData;
    return compiler.compile(string)(data);
}

describe('configuration', function()
{
    it('should be an object', function(){
        expect(grenade).to.be.a('object');
        expect(compiler).to.be.an.instanceof(grenade.Compiler);
    });
    it('should have class instances to extensions', function(){
        expect(grenade.Compiler).to.not.equal(undefined);
        expect(grenade.Tag).to.not.equal(undefined);
        expect(grenade.Filter).to.not.equal(undefined);
        expect(grenade.Template).to.not.equal(undefined);
    })

    it('should set a root path', function(){
        expect(compiler.rootPath).to.equal(path.normalize(demopath));
    });
    it('should have correct extension', function(){
        expect(compiler.extension).to.equal(options.extension);
    });
    it('should create the correct filepath', function(){
        expect(compiler.path('content')).to.equal(compiler.rootPath + "content." + options.extension);
        expect(compiler.path('layout/content')).to.equal(compiler.rootPath + "layout/content." + options.extension);
    });
});

describe('basic strings', function()
{
    it('should throw error if no arguments given', function(){
        expect(compiler.template).to.throw('A string is required');
    });

    it('should return empty string if given empty string', function(){
        var template = compiler.compile(EMPTY);
        expect( template({}) ).to.equal(EMPTY);
        expect( template() ).to.equal(EMPTY);
        expect( template(sampleData) ).to.equal(EMPTY);
    });

    it('should return same string if no tags are present', function(){
        var template = compiler.compile('just a string');
        expect( template() ).to.equal('just a string');
        expect( template({}) ).to.equal('just a string');
        expect( template(sampleData) ).to.equal('just a string');
    })
});

describe('variables', function()
{

    it('should resolve escaped variable, non-html', function(){
        var string = sampleData.test;
        expect(compile("${data.test}")).to.equal(string);
        expect(compile("${ data.test }")).to.equal(string);
        expect(compile("${data.test  }  ")).to.equal(string);
        expect(compile("${data.test}${data.comment}")).to.equal(sampleData.test + sampleData.comment);
        expect(compile("${data.test} ${data.comment}")).to.equal(sampleData.test + " " +sampleData.comment);
    });
    it('should resolve raw variable, non-html', function(){
        var string = sampleData.test;
        expect(compile("${=data.test}")).to.equal(string);
        expect(compile("${ =data.test }")).to.equal(string);
        expect(compile("${ = data.test  }  ")).to.equal(string);
    });
    it('should resolve escaped variable html', function(){
        var string = grenade.Filter.apply('escape', sampleData.html);
        expect(compile("${data.html}")).to.equal(string);
        expect(compile("${ data.html }")).to.equal(string);
        expect(compile("${ data.html }  ")).to.equal(string);
    });
    it('should resolve raw variable html', function(){
        var string = sampleData.html;
        expect(compile("${=data.html}")).to.equal(string);
        expect(compile("${=data.html }")).to.equal(string);
        expect(compile("${ = data.html }")).to.equal(string);
        expect(compile("${ =  data.html   } ")).to.equal(string);
    });
    it('should resolve comment as empty string', function(){
        expect(compile("${#data.comment}")).to.equal(EMPTY);
        expect(compile("${#This is a comment}")).to.equal(EMPTY);
        expect(compile("${#  This is a comment }")).to.equal(EMPTY);
        expect(compile("${  # This is a comment }  ")).to.equal(EMPTY);
    });
    it('should return numbers as a string, including zero', function(){
        expect(compile("${data.zero}${data.one}")).to.equal("01");
    })
});

describe('functions', function(){
    it('should call a function', function(){
        expect(compile("${data.func()}")).to.equal("called");
    });
    it('should call a function with arguments', function(){
        expect(compile("${data.add(1,2)}")).to.equal("3");
    })
});

describe('@if @else', function()
{
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

describe('@unless @else', function(){
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

describe('@foreach', function()
{
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

describe('filters', function(){

    it('should apply a filter', function(){
        var expected = sampleData.test.toUpperCase();
        expect(compile("${data.test | toUpper}")).to.equal(expected);
        expect(compile("${data.test | toUpper }")).to.equal(expected);
        expect(compile("${=data.test  | toUpper}")).to.equal(expected);
    });
    it('should apply multiple filters', function(){
        var expected  = grenade.Filter.apply('slug', sampleData.test).toUpperCase();
        expect(compile("${data.test | slug,toUpper}")).to.equal(expected);
        expect(compile("${data.test | slug,toUpper }")).to.equal(expected);
        expect(compile("${=data.test  | slug,toUpper}")).to.equal(expected);
    });

});