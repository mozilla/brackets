/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module){
    "use strict";

    var _          = brackets.getModule("thirdparty/lodash"),
        Promise    = require("libs/js/spromise"),
        requireUID = 1;

    function workerThreadPluginLoader(pluginsMeta) {
        if (!pluginsMeta.directories.length) {
            return Promise.resolve();
        }

        var currentRequest, lastMessage;
        var pendingRequest = Promise.defer();
        var worker         = new Worker(module.uri.substring(0, module.uri.lastIndexOf("/")) + "/pluginWorker.js");


        // Process worker thread messages
        worker.onmessage = function onmessage(evt) {
            var data = evt.data;

            if (data.type === "debug") {
                console.log(data);
                return;
            }

            if (currentRequest.state() === "pending") {
                currentRequest.resolve(data);
            }
        };


        worker.onerror = function onerror(evt) {
            console.error("error", evt);
        };


        function postMessage(message) {
            lastMessage = message;

            if (currentRequest && currentRequest.isPending()) {
                pendingRequest.resolve(); // Skip whatever is pending and queue another request
                return (pendingRequest = Promise.defer()).then(resolveRequest.bind(null, message));
            }
            else {
                worker.postMessage(message);
                return (currentRequest = Promise.defer()).then(resolveRequest.bind(null, message));
            }
        }


        function resolveRequest(message, response) {
            if (!response) {
                return;
            }

            // If there is data pending, then send it
            if (message !== lastMessage) {
                console.log("send queued message");
                currentRequest = pendingRequest;
                worker.postMessage(message);
            }

            return response.data;
        }


        function loadPlugins(plugins) {
            var plugin;
            for (var iplugin in plugins) {
                plugin = plugins[iplugin];

                // Add a lint interface that will be just posting a message to the worker thread
                _.merge(plugin, api(plugin));
            }

            return plugins;
        }


        // Api for plugin linters
        function api(plugin) {
            function lint(text, settings) {
                return postMessage({
                    type: "lint",
                    data: {
                        name: plugin.name,
                        text: text,
                        settings: settings
                    }
                })
                .then(function(response) {
                    return response.result;
                });
            }

            return {
                lint: lint
            };
        }


        // Send request to init
        return postMessage({
            "type": "init",
            "data": {
                "baseUrl": pluginsMeta.path,
                "packages": pluginsMeta.directories
            }
        })
        .then(loadPlugins);
    }


    return {
        workerThreadPluginLoader: workerThreadPluginLoader
    };
});
