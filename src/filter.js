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
     * Apply the given filters in order on the value given.
     * @param filters array|string
     * @param value string
     * @param data object
     * @returns {string}
     */
    apply(filters,value,data)
    {
        if (! filters || !filters.length) return value;

        if (! Array.isArray(filters)) {
            filters = [filters];
        }
        for (var i=0; i<filters.length; i++)
        {
            var filter = this.get(filters[i]);
            if (filter) {
                value = filter(value, data);
            }
        }
        return value;
    }

    /**
     * Create a new filter.
     * @param name string
     * @param action Function
     */
    extend(name,action)
    {
        this.filters[name] = action;
    }
}

module.exports = new FilterFactory();