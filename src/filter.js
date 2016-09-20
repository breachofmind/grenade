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
            if (! filters || ! filters.length) {
                return value;
            }
            for (var i=0; i<filters.length; i++) {
                var name = filters[i].trim();
                var filter = factory.get(name);
                if (filter) {
                    value = filter.action(value,data);
                }
            }
            return value.toString();
        }
    }

    /**
     * Create a new filter.
     * @param name string
     * @param opts object
     * @param action Function
     * @returns Filter
     */
    extend(name,opts,action)
    {
        if (arguments.length == 2) {
            action = opts;
            opts = {};
        }
        var filter = new Filter(name,opts,action);
        if (filter.prefix) {
            this.prefixes[filter.prefix] = filter;
        }

        return this.filters[name] = filter;
    }
}

/**
 * Filter class.
 */
class Filter
{
    constructor(name,opts,action)
    {
        if (! opts) opts = {};

        this.name = name;
        this.action = action;

        // Transform the text given to something
        // the compiled javascript can use.
        this.transform = opts.transform || false;

        // A variable can have custom prefixes.
        // Such as: "=", which escapes the value.
        // Prefix filters occur after all other filters.
        this.prefix = opts.prefix || false;

        // When using a prefix, is it the first filter applied or last?
        this.pushPrefix = opts.pushPrefix || false;
    }
}

module.exports = new FilterFactory();