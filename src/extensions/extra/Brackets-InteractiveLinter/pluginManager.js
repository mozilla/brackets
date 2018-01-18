/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    "use strict";

    var _                  = brackets.getModule("thirdparty/lodash"),
        FileSystem         = brackets.getModule("filesystem/FileSystem"),
        pluginLoader       = require("pluginLoader"),
        Promise            = require("libs/js/spromise"),
        pluginDirectory    = module.uri.substring(0, module.uri.lastIndexOf("/")),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        preferences        = PreferencesManager.getExtensionPrefs("interactive-linter");


    var webworker;
    preferences.definePreference("webworker", "boolean", true).on("change", function() {
        webworker = preferences.get("webworker");
    });


    /**
     * pluginManager is the processor for loading up plugins in the plugins directory in
     * make sure they are smoothly running in a worker thread.
     */
    function pluginManager() {
        var plugins = [{
            directories: ["csslint", "eslint", "htmlhint", "jsonlint"],
            path: "plugins/default/threaded"
        }];

        return Promise.all(plugins.map(loadPlugin)).then(pluginsLoaded);
    }

    function loadPlugin(plugin) {
        return pluginLoader.workerThreadPluginLoader(plugin);
    }

    function pluginsLoaded(plugins) {
        return _.extend.apply(_, plugins);
    }

    return pluginManager;
});

