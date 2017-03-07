define(function (require, exports, module) {
    "use strict";

    var ConsoleManagerRemote = require("text!lib/ConsoleManagerRemote.js");

    function getRemoteScript() {
        return "<script>\n" + ConsoleManagerRemote + "</script>\n";
    }

    function isConsoleRequest(msg) {
        return msg.match(/^bramble-console/);
    }

    function consoleRequest(msg) {
        console.log("Bramble Console: " + msg);
    }

    exports.getRemoteScript = getRemoteScript;
    exports.isConsoleRequest = isConsoleRequest;
    exports.consoleRequest = consoleRequest;
});
