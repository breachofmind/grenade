"use strict";

var Expressway = require('expressway');
var grenade = require('grenade');

class GrenadeEngineProvider extends Expressway.Provider
{
    constructor(app)
    {
        super(app);

        this.requires = ['ExpressProvider'];

        this.options = {
            debug:          false,
            prettyPrint:    false,
            extension:      "htm",
            enableCache:    app.env !== ENV_LOCAL,
            rootPath:       app.path('views_path', '../resources/views'),
            componentPath:  app.path('components_path', 'components')
        }
    }

    /**
     * Register with the application.
     * @param app Application
     * @param express Express
     * @param event EventEmitter
     */
    register(app,express,event)
    {
        var opts = this.options;

        grenade.express(express, opts);

        grenade.Filter.extend(
            'lang',
            {
                prefix:">",
                pushPrefix:false
            },
            function(value,data) {
                return data.lang(value);
            });

        // Make sure the right extension is being used.
        event.on('application.bootstrap', function(app) {
            express.set('view engine', opts.extension);
        })
    }
}

module.exports = GrenadeEngineProvider;