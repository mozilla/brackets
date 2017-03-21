define(function (require, exports, module) {
    "use strict";

    var ConsoleManagerRemote = require("text!lib/ConsoleManagerRemote.js");

    function getRemoteScript() {
        return "<script>\n" + ConsoleManagerRemote + "</script>\n";
    }

    function isConsoleRequest(msg) {
        return msg.match(/^bramble-console/);
    }

    function handleConsoleRequest(data) {
		var args = data.args;
		var type = data.type || "log";

		// TODO: Show this in Custom Console UI, see issue #1675 in Thimble
        console[type].apply(console, args);
    }

    exports.getRemoteScript = getRemoteScript;
    exports.isConsoleRequest = isConsoleRequest;
    exports.handleConsoleRequest = handleConsoleRequest;
});
