"use strict";

var _     = require('lodash');
var fs    = require('fs');
var path  = require('path');
var utils = require('./utils');
var Tag   = require('./tag');

class Template
{
    constructor(input,parent)
    {
        this.input = input;
        this.output = [];
        this.parent = parent;
        this.tags = [];
        this.source = null;

        this.walk();
        this.generate();
    }

    /**
     * Walk through the input and find some tags.
     */
    walk()
    {
        this.output = this.input.split(utils.RX_TAGS);

        for(let i=0; i<this.output.length; i++)
        {
            let match = this.scan(i);

            if (! match) {
                this.vars(i);
                continue;
            }

            // If matching a tag block, skip ahead after finding closing.
            // Finding an outer tag will create a new scoped Template object.
            if (match.tag.block) {
                i = this.outer(match);
            }
            // A match will have a start and end index and scope.
            // It's safe to add it to our tag array.
            if (match.opening) {
                match.tag.evaluate(match,this);
                match.add();
            }
        }
    }

    /**
     * Get the outer matching tag.
     * @param match TagObject
     * @returns {number}
     */
    outer(match)
    {
        var open = 1;
        var startIndex = match.start + 1;
        for(var i = startIndex; i < this.output.length; i++)
        {
            var close = this.scan(i);

            if (!close || close.name !== match.name) {
                continue;
            }

            open = close.opening ? open + 1 : open - 1;

            if (open == 0) {
                match.end = i;
                match.scope = new Template(this.join(startIndex,i), this);
                this.output[match.start] = match.scope;
                this.output[match.end] = "";
                return i;
            }
        }
    }

    join(start,end)
    {
        var output = "";
        for (var i=start; i<end; i++) {
            output += this.output[i];
            this.output[i] = "";
        }
        return output;
    }


    scan(index)
    {
        var line = this.output[index];

        if (! line || line=="" || line[0] !== "@") {
            return null;
        }

        return new TagObject(utils.RX_TAG.exec(line), this, index);
    }

    vars(index)
    {
        var line = this.output[index];
        if (!line || !line.length) {
            return;
        }

        var arr = line.split(utils.RX_VARS);
        if (arr.length == 1) {
            return;
        }

        for(var i=0; i<arr.length; i++)
        {
            var match = utils.RX_VAR.exec(arr[i]);
            if (! match) continue;

            arr[i] = utils.parseVar(match[1],i);
        }

        this.output[index] = arr;
    }

    generate()
    {
        var src = [];

        this.output.map(function(line)
        {
            if (!line || line == "") return;

            if (line instanceof Template) {

                return src.push(line.source);

            } else if (line instanceof TagObject) {

                return src.push(`this.tag(data,${line.key})`);

            } else if (Array.isArray(line)) {
                return src.push (line.map(function(ln) {
                    if (typeof ln == 'string') return JSON.stringify(ln);
                    if (typeof ln == 'object') {
                        var args = JSON.stringify(ln);
                        return `this.prop(data,${args})`;
                    }
                }).join(" + "));
            } else {
                return src.push(JSON.stringify(line)); // just a string
            }

        });

        //this.source = `(function() {try { return ${src.join(" + ")} } catch (e) { return e; };})()`;
        this.source = src.join(" + ");
    }

    prop(data,args)
    {
        return "";
    }

    tag(data,key)
    {
        var tag = this.tags[key];
        return tag.name;
    }

    render(data)
    {
        var fn = new Function('data', "return" + this.source);

        var str = fn.apply(this,[data]);
        return str;
    }
}

class TagObject
{
    constructor(match,template,index)
    {
        var opening = match[2] ? true : false;
        var tag = opening ? Tag.get(match[2]) : Tag.get(match[1].replace("end",""));

        this.key = null;
        this.tag = tag;
        this.name = tag.name;
        this.opening = opening;
        this.template = template;
        this.args = opening ? tag.parse(match[3], template) : null;
        this.start = index;
        this.end = null;
        this.scope = null;
    }

    add()
    {
        this.key = this.template.tags.length;
        this.template.tags.push(this);
    }
}

module.exports = Template;