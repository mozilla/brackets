define(function (require, exports, module) {
    "use strict";

    var ConsoleInterfaceManager = require("lib/ConsoleInterfaceManager"),
        ConsoleManagerRemote = require("text!lib/ConsoleManagerRemote.js");

    function getRemoteScript() {
        return "<script>\n" + ConsoleManagerRemote + "</script>\n";
    }

    function isConsoleRequest(msg) {
        return msg.match(/^bramble-console/);
    }

    function handleConsoleRequest(data) {
        var args = data.args;
        var type = data.type || "log";

        if (type === "time" || type === "timeEnd"){
            args[0] = type + ": " + args[0];
        }

        if (args) {
            ConsoleInterfaceManager.add(type, args);
        }
    }

    exports.getRemoteScript = getRemoteScript;
    exports.isConsoleRequest = isConsoleRequest;
    exports.handleConsoleRequest = handleConsoleRequest;
});
