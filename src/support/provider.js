"use strict";

var Expressway = require('expressway');
var grenade = require('grenade');
var Filter = grenade.Filter;

class GrenadeEngineProvider extends Expressway.Provider
{
    constructor(app)
    {
        super(app);

        this.order = 20;

        this.requires = [
            'AppModule',
        ];

        this.options = {
            debug:          false,
            prettyPrint:    false,
            extension:      "htm",
            enableCache:    app.env !== ENV_LOCAL,
        }
    }

    /**
     * Register with the application.
     * @param AppModule Module
     * @param path PathService
     */
    register(AppModule,app,path)
    {
        this.options.componentPath = path.root('components/').get();
        this.options.rootPath = path.views().get();

        grenade.express(AppModule.express, this.options);
        AppModule.set('view engine', this.options.extension);

        // Also, create a compiler with the options.
        app.register('grenade', new grenade.Compiler(this.options), "Grenade Templater compiler");
    }

    /**
     * Set the view engine.
     * @param router Router
     * @param app Application
     */
    boot(app)
    {
        if (app.has('localeService')) {
            Filter.extend('lang', {
                prefix:">",
                order:-1,
                action: function(value,data) {
                    return data.lang(value);
                }
            });
        }

        Filter.extend('route', {
            prefix:"~",
            order: -1,
            transform: function(text) {
                return JSON.stringify(text.split("/"));
            },
            action: function(value,data) {
                return app.alias(value.shift()) + (value.length ? "/"+value.join("/"): "");
            }
        })
    }
}

module.exports = GrenadeEngineProvider;
