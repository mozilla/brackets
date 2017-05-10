define(function (require, exports, module) {
    "use strict";

    var ConsoleInterfaceManager = require("lib/ConsoleInterfaceManager"),
        BlobUtils = brackets.getModule("filesystem/impls/filer/BlobUtils"),
        Path = brackets.getModule("filesystem/impls/filer/BracketsFiler").Path,
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

        if (type === "error-handler") {
            var regex = new RegExp('(blob:.+):([^:]+):(.+)', 'gm'),
                endingRegex = new RegExp(':([0-9]+):([0-9]+)$', 'gm'),
                stackTrace = args["stack"].split("@"),
                newArgs = [];

            // Handle Blob URLs
            for(var i = 1; i < stackTrace.length; i++){
                var stackItem = stackTrace[i].match(regex);
                stackItem = Path.basename(BlobUtils.getFilename(stackItem[0].replace(endingRegex, '')));
                newArgs.push(stackItem + "\n");
            }

            newArgs.splice(0, 0, args["messsage"]);
            args = newArgs;
            type = "error";
        }

        if (type === "time" || type === "timeEnd"){
            args[0] = type + ": " + args[0];
        }

        if (args){
            ConsoleInterfaceManager.add(type, args);
        }
    }

    exports.getRemoteScript = getRemoteScript;
    exports.isConsoleRequest = isConsoleRequest;
    exports.handleConsoleRequest = handleConsoleRequest;
});
