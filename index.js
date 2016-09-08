var TemplateFactory = require('./src/factory');
var Template = require('./src/template');
var TagObject = require('./src/match');
var Walker = require('./src/walker');
var Tag = require('./src/tag');
var tags = require('./src/tags');

var fn = function(){
    return new TemplateFactory(tags);
};

fn.Template = Template;
fn.Tag = Tag;

module.exports = fn;