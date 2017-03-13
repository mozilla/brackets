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
        
        switch(type) {
            case "log":
                console.log.apply(console, args);
                break;
            case "info":
                console.info.apply(console, args);
                break;
            case "debug":
                console.debug.apply(console, args);
                break;
            case "warn":
                console.warn.apply(console, args);
                break;
            case "error":
                console.error.apply(console, args);
                break;
            case "clear":
                console.clear.apply(console);
                break;
            case "time":
                args[0] = args[0] + " " + args[1];
                console.time.apply(console, args);
                break;
            case "timeEnd":
                args[0] = args[0] + " " + args[1];
                console.timeEnd.apply(console, args);
                break;
            default:
        }
    }

    exports.getRemoteScript = getRemoteScript;
    exports.isConsoleRequest = isConsoleRequest;
    exports.handleConsoleRequest = handleConsoleRequest;
});
