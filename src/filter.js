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
     * Apply a filter to a value.
     * @param name string
     * @param value string
     * @param data object
     * @returns {string}
     */
    applyFilter(name,value,data)
    {
        var filter = this.get(name.trim());
        if (filter) {
            return filter(value.toString(),data);
        }
        return value;
    }

    /**
     * Return a helper function for the compiled template.
     * @returns {Function}
     */
    func()
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
                    value = filter(value.toString(),data);
                }
            }
            return value;
        }
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