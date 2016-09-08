"use strict";

var Tag = require('./tag');

class TagObject
{
    constructor(match,template)
    {
        this.key = null;
        this.tag = Tag.get(match[2]);
        this.name = this.tag.name;
        this.template = template;
        this.scope = null;

        this.parse = this.tag.parse.bind(this);
        this.evaluate = this.tag.evaluate.bind(this);
        this.render = this.tag.render.bind(this);

        this.args = this.parse(match[3]);
    }

    add()
    {
        this.index = this.template.output.length;
        this.template.output.push(this);
        this.key = this.template.root.tags.length;
        this.template.root.tags.push(this);
    }

    replaceWith(what)
    {
        return this.template.output[this.index] = what;
    }

    erase()
    {
        return this.replaceWith("");
    }
}

module.exports = TagObject;