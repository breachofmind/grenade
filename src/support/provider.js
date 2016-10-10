"use strict";

var Expressway = require('expressway');

module.exports = function(grenade,opts)
{
    return class GrenadeProvider extends Expressway.Provider
    {
        constructor(app)
        {
            super(app);

            this.requires = ['ExpressProvider'];
        }

        /**
         * Register with the application.
         * @param app Application
         * @param express Express
         */
        register(app,express)
        {
            var options = opts || {
                rootPath:  app.path('views_path'),
                enableCache: app.env !== ENV_LOCAL,
                extension: "htm"
            };

            grenade.express(express, options);

            grenade.Filter.extend(
                'lang',
                {
                    prefix:">",
                    pushPrefix:false
                },
                function(value,data) {
                    return data.lang(value);
                });
        }
    }
};