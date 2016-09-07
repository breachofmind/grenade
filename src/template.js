"use strict";

var _     = require('lodash');
var fs    = require('fs');
var path  = require('path');
var utils = require('./utils');
var Tag   = require('./tag');

const RX_VAR = /\$\{(.*?)\}/gm;
const RX_FNC = /\$\{(\_\_.*?)\}/gm;
//const RX_TAG = /\s*?\@((\w+)\((.*)\)|(\w+))/gm;
const RX_TAG = /\s*?(\@.*[^\s+])/gm;
const RX_LINE = /\@((\w+)\((.*)\)|(\w+))/;

class Template
{
    constructor(input,parent)
    {
        this.input = input;
        this.output = [];
        this.parent = parent;
        this.tags = [];

        this.walk();
    }

    walk()
    {
        this.output = this.input.split(RX_TAG);
        var tags = [];

        function scan(line)
        {
            if (line=="" || line[0] !== "@") {
                return null;
            }
            var match = RX_LINE.exec(line);
            var opening = match[2] ? true : false;
            var tag = opening ? Tag.get(match[2]) : Tag.get(match[1].replace("end",""));

            return {
                object:tag,
                name: tag.name,
                opening: opening,
                args:opening? tag.parse(match[3],this): null,
                start:null,
                end:null,
                scope:null
            }
        }

        function join(start,end) {
            var output = "";
            for (let i=start; i<end; i++) {
                output += this.output[i];
            }
            return output;
        }

        for(let i=0; i<this.output.length; i++)
        {
            let line = this.output[i];
            let tag = scan.call(this,line);

            if (tag) {
                tag.start = i;
                if (tag.object.block) {
                    let open = 1;
                    for(let n=i+1; n<this.output.length; n++)
                    {
                        let close = scan.call(this,this.output[n]);

                        if (!close || close.object.name !== tag.object.name) {
                            continue;
                        }
                        open = close.opening ? open + 1 : open - 1;
                        if (open == 0) {
                            tag.end = n;
                            tag.scope = new Template(join.call(this,i+1,n), this);
                            break;
                        }
                    }
                    this.output[i] = tag.scope;
                    for (let n=tag.start+1; n<tag.end; n++)
                    {
                        this.output[n] = "";
                    }
                }

                if (tag.opening) {
                    tag.object.evaluate(tag,this);
                    tags.push(tag);
                }
            }
        }

        this.tags = tags;
    }

    render(data)
    {
        var template = this;
        return this.output.map(function(line) {
            if (line instanceof Template) {
                return line.render(data);
            } else if (typeof line == 'function') {
                return line(data,template);
            }
            return line;
        }).join("");
    }
}

module.exports = Template;