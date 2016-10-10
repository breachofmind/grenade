"use strict";

var grenade = require('grenade');
var utils   = require('./support/utils');
var append  = utils.append;
var YAML    = require('yamljs');

/**
 * A tag in a template.
 * @constructor
 */
class TemplateTag
{
    constructor(match,template)
    {
        this.key        = null;
        this.index      = null;
        this.text       = match.text;
        this.type       = match.tag.name;
        this.evaluated  = false;
        this.template   = template;
        this.tag        = match.tag;
        this.start      = match.start;
        this.end        = match.end;
        this.source     = null;
        this.args       = null;
        this.scope      = null;
        this.data       = null;

        if (this.tag.block) {
            if (this.tag.yaml) {
                this.data = YAML.parse(`${match.scope}`);
            } else {
                this.scope = new grenade.Template(match.scope, template, this);
            }
        }

        if (this.tag.hasArguments) {
            this.args = this.tag.parse.call(this, match.args, template);
        }
    }

    /**
     * Set the source code.
     * @param source string
     * @returns {*}
     */
    setSource(source)
    {
        return this.source = source;
    }

    /**
     * Evaluate a tag after it has been collected and parsed.
     * @returns void
     */
    evaluate()
    {
        if (! this.evaluated) {
            this.evaluated = true;
            this.tag.evaluate.call(this, this.template);

            // Use the default source for rendering.
            if (! this.source && this.tag.render) {
                var passArgs = this.tag.passArguments ? `,${this.args}` : ",null";
                this.setSource(append(`__tag["${this.key}"].render(${this.template.compiler.localsName}${passArgs})`));
            }
        }
    }

    /**
     * Call the tag render method.
     * @param data object
     * @param args mixed
     * @returns {string}
     */
    render(data,args)
    {
        if (! this.tag.render) {
            throw (`Tag @${this.type} does not have a render() method`);
        }
        return this.tag.render.call(this,data,args,this.template);
    }

    /**
     * Store this tag in the tag index.
     * It's rendering function can be used later in the source.
     * @return string
     */
    store()
    {
        var root = this.template.root;
        var len = Object.keys(root._tagIndex).length;
        this.key = `\$${this.template.id}\$${len}`;
        root._tagIndex[this.key] = this;

        return this.key;
    }

    /**
     * Replace the tag in the output with the given.
     * @param what string|TemplateTag|TemplateVar|Template
     * @returns {TemplateTag}
     */
    replaceWith(what)
    {
        this.template.output[this.index] = what;
        return this;
    }

    /**
     * Flatten the object (for debugging)
     * @returns {{tag: *, scope: *}}
     */
    flatten()
    {
        return {tag:this.type, scope: this.scope? this.scope.flatten() : null};
    }
}

TemplateTag.REGEX = /\@((\w+)\((.*)\)|(\w+))/gm;

module.exports = TemplateTag;