"use strict";

const MODE_COMMENT = "#";
const MODE_RAW = "=";

/**
 * A matching variable in the template.
 */
class MatchVar
{
    /**
     * Parse a string containing a variable.
     * @param property string
     * @param template Template
     */
    constructor(property,template)
    {
        this.key = null;
        this.index = null;
        this.text = property;
        this.template = template;
        this.property = property;
        this.mode = null;
        this.filters = [];

        this._parse(property);
    }

    /**
     * Check if this is a function call.
     * @returns {boolean}
     */
    get isFunction()
    {
        return this.text.indexOf("(") > -1 && this.text.indexOf(")") > -1
    }

    /**
     * Parse the incoming string.
     * @param property string
     * @private
     */
    _parse(property)
    {
        // Remove the outer braces.
        property = property.replace("${", "");
        property = property.substr(0, property.length-1);
        this.text = property;

        // Check the evaluation mode.
        var chr = property[0];
        this.mode = chr == MODE_RAW || chr == MODE_COMMENT ? chr : null;
        if (this.mode) {
            property = property.replace(this.mode,"");
        }

        // Get the filter functions.
        var filters = property.split(" | ",2);
        if (filters.length > 1) {
            this.filters = filters[1].split(",");
            property = filters[0].trim();
        }

        // Get the function arguments.
        if (this.isFunction) {
            property = property.substr(0,property.indexOf("("));
        }

        this.property = property;
    }

    /**
     * Add the object to the output.
     */
    add()
    {
        this.index = this.template.output.length;
        this.template.output.push(this);

        this.key = this.template.compiler.vars.length;
        this.template.compiler.vars.push(this);

        this.source = `this.prop(data,${this.key})`;
        if (this.isFunction) {
            this.source = `(function(){ with(data) {return ${this.text}; } })()`;
        }
    }

    toString()
    {
        return this.source;
    }
}



module.exports = MatchVar;