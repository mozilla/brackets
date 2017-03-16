define(function (require, exports, module) {
    "use strict";

    var ConsoleManagerRemote = require("text!lib/ConsoleManagerRemote.js");

    function getRemoteScript() {
        return "<script>\n" + ConsoleManagerRemote + "</script>\n";
    }

    function isConsoleRequest(msg) {
        return msg.match(/^bramble-console/);
    }

    function handleConsoleRequest(args, type) {
        // Add an indentifier to the front of the args list
        args.unshift("[Bramble Console]:");
       
        // Time related arguments
        if(type === "time" || type === "timeEnd") {
            args[0] = args[0] + " " + args[1];
        }
        
        console[type].apply(console, args);
    }

    exports.getRemoteScript = getRemoteScript;
    exports.isConsoleRequest = isConsoleRequest;
    exports.handleConsoleRequest = handleConsoleRequest;
});
