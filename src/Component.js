"use strict";

var _ = require('lodash');

class Component
{
    /**
     * Constructor.
     * @param tag TemplateTag
     */
    constructor(tag)
    {
        this.tag = tag;
        this.data = {};
        this.scope = null;
    }

    /**
     * Get the tag arguments.
     * @returns {object}
     */
    get args()
    {
        return this.tag.args;
    }

    /**
     * Get the passed parameters.
     * @returns {*}
     */
    get params()
    {
        return this.args.params;
    }

    /**
     * Merge the given data object with this components data.
     * @param data object
     */
    merge(data)
    {
        this.data = _.merge(data,this.data);
    }

    /**
     * Render the component.
     * @param data object
     * @returns {Promise}
     */
    render(data)
    {
        this.merge(data);

        return this.scope.render(this.data);
    }
}

module.exports = Component;