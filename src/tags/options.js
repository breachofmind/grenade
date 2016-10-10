"use strict";

var Tag = require('../Tag');
var utils = require('../support/utils');

/**
 * Given an array of objects,
 * Render <option> elements.
 */
Tag.extend('options', {
    parse: utils.parseForEach,
    evaluate: function(template)
    {
        var id = this.args.index;
        var label = this.args.key;

        this.setSource(`
        __out += (function(){
            return ${this.args.array}.map(function(obj){
                return '<option value="'+ obj["${id}"] +'">'+obj["${label}"]+'</option>';
            }).join("\\n");
        })();
        `);
    }
});