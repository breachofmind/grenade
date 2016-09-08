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

        this.walk();
        this.source();
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

            if (! match) continue;

            // If matching a tag block, skip ahead after finding closing.
            // Finding an outer tag will create a new scoped Template object.
            if (match.tag.block) {
                i = this.outer(match);
            }
            // A match will have a start and end index and scope.
            // It's safe to add it to our tag array.
            if (match.opening) {
                match.tag.evaluate(match,this);
                this.tags.push(match);
            }
        }

        // Of the strings left over, find variables.
        for (let i=0; i<this.output.length; i++) {
            this.vars(i);
        }
    }

    /**
     * Get the outer matching tag.
     * @param match object
     * @returns {number}
     */
    outer(match)
    {
        var open = 1;
        var startIndex = match.start + 1;
        for(var i = startIndex; i < this.output.length; i++)
        {
            var close = this.scan(i);

            if (!close || close.tag.name !== match.tag.name) {
                continue;
            }

            open = close.opening ? open + 1 : open - 1;

            if (open == 0) {
                match.end = i;
                match.scope = new Template(this.join(startIndex,i), this);
                break;
            }
        }
        this.output[match.start] = match.scope;
        this.output[match.end] = "";
        return i;
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
        var match = utils.RX_TAG.exec(line);
        var opening = match[2] ? true : false;
        var tag = opening ? Tag.get(match[2]) : Tag.get(match[1].replace("end",""));

        return {
            tag: tag,
            name: tag.name,
            opening: opening,
            template: this,
            args: opening ? tag.parse(match[3],this): null,
            start: opening ? index : null,
            end: null,
            scope: null
        };
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

    source()
    {

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