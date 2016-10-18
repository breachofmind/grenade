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
        /**
         * The matching tag object.
         * @type {TemplateTag}
         */
        this.tag = tag;

        /**
         * Data for this view.
         * @type {{}}
         */

        this.data = {};

        /**
         * The view to use, relative to the view path.
         * @type {string|null}
         */
        this.view = null;

        /**
         * If not using a view, the string template to compile.
         * @type {string}
         */
        this.template = "";

        /**
         * The Template scope.
         * @type {Template|null}
         */
        this.scope = null;

        /**
         * Merge the passed parameters with the data?
         * @type {boolean}
         */
        this.mergeParams = true;
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
        this.data = _.merge(this.data,data);
    }

    /**
     * Render the component.
     * @param data object
     * @returns {Promise}
     */
    render(data)
    {
        if (this.mergeParams) this.merge(this.params);
        this.merge(data);
        return this.scope.render(this.data);
    }
}

module.exports = Component;