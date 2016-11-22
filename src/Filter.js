"use strict";

/**
 * A factory for defining value filters.
 * @author Mike Adamczyk <mike@bom.us>
 */
class FilterFactory
{
    constructor()
    {
        this.filters = {};
        this.prefixes = {};
    }

    /**
     * Get a filter by name.
     * @param name string
     * @returns {Function|null}
     */
    get(name)
    {
        return this.filters[name.trim()] || null;
    }


    /**
     * Apply a filter to a value.
     * @param name string
     * @param value string
     * @param data object
     * @returns {string}
     */
    apply(name,value,data)
    {
        var filter = this.get(name.trim());
        if (filter) {
            return filter.action(value,data);
        }
        return value;
    }

    /**
     * Return a helper function for the compiled template.
     * @returns {Function}
     */
    functions()
    {
        var factory = this;
        return function(value,data,filters)
        {
            if (filters && filters.length && value)
            {
                for (var i=0; i<filters.length; i++)
                {
                    var name = filters[i].trim();
                    var filter = factory.get(name);
                    if (filter) {
                        value = filter.action(value,data);
                    }
                }
            }

            return typeof value == 'undefined' ? "undefined" : value.toString();
        }
    }

    /**
     * Create a new filter.
     * @param name string
     * @param opts object|function
     * @returns Filter
     */
    extend(name,opts)
    {
        if (typeof opts === 'function') {
            opts = {action: opts};
        }
        var filter = new Filter(name,opts);
        if (filter.prefix) {
            this.prefixes[filter.prefix] = filter;
        }

        return this.filters[name] = filter;
    }
}

FilterFactory.prototype.Transform = {
    STRING: function(text) {
        return `"${text}"`;
    },
    OBJECT: function(text) {
        return `{${text}}`;
    }
};

/**
 * Filter class.
 */
class Filter
{
    constructor(name,opts)
    {
        if (! opts) opts = {};

        if (typeof opts.action !== 'function') {
            throw new Error(`Filter "${name}" has no action`);
        }

        this.name = name;
        this.action = opts.action;

        // Transform the text given to something
        // the compiled javascript can use.
        this.transform = opts.transform || false;

        // A variable can have custom prefixes.
        // Such as: "=", which escapes the value.
        // Prefix filters occur after all other filters.
        this.prefix = opts.prefix || false;

        // When using a prefix, is it the first filter applied or last?
        // 1 = last, -1 first
        this.order = opts.order || 1;
    }
}

module.exports = new FilterFactory;