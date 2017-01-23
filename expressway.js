"use strict";

var grenade = require('grenade');
var _ = require('lodash');

/**
 * A helper function for adding grenade to an Expressway app.
 * @author Mike Adamczyk <mike@bom.us>
 */
module.exports = function(app,extension,opts,paths)
{
    var defaultOptions = {
        debug:          false,
        prettyPrint:    false,
        extension:      "htm",
        enableCache:    app.env !== ENV_LOCAL,
        rootPath:       paths.views(),
        componentPath:  paths.components(),
    };

    opts = _.assign({},defaultOptions,opts);

    // Add to the extension.
    grenade.express(extension.express, opts);

    extension.express.set('views', opts.rootPath);
    extension.express.set('view engine', opts.extension);
};