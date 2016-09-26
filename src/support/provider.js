"use strict";

var expressway = require('expressway');

module.exports = function(grenade,opts)
{
    class GrenadeProvider extends expressway.Provider
    {
        constructor()
        {
            super('grenade');

            this.requires('express');
        }

        register(app)
        {
            var options = opts || {
                rootPath:  app.path('views_path'),
                enableCache: app.env !== ENV_LOCAL,
                extension: "htm"
            };

            grenade.express(app.express, options);

            grenade.Filter.extend('lang',{prefix:">", pushPrefix:false}, function(value,data) {
                return data.lang(value);
            });
        }
    }

    return new GrenadeProvider();
}