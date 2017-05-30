(function(transport, console) {
    "use strict";

    function transportSend(type, args) {
        var data = {args: args, type: type};
        transport.send("bramble-console", data);
    }

    // Implement standard console.* functions
    ["log",
     "warn",
     "info",
     "debug",
     "info",
     "error",
     "clear",
     "time",
     "timeEnd"].forEach(function(type) {
        console[type] = function() {
            var args = Array.prototype.slice.call(arguments);
            var data = [];

            // Flatten data to send, deal with Error objects
            args.forEach(function(arg) {
                if(arg instanceof Error) {
                    data.push(arg.message);
                    data.push(arg.stack);
                } else {
                    data.push(arg);
                }
            });

            transportSend(type, data);
        };
    });

    // Implements global error handler for top-level errors
    window.addEventListener("error", function(messageOrEvents) {
        var message = messageOrEvents.message;
        var error = messageOrEvents.error || {};
        var stack = error.stack || "Error Interpretting Stack";

        transportSend("error", [ message, stack ]);
    }, false);

    console.assert = function() {
        var args = Array.prototype.slice.call(arguments);
        var expr = args.shift();
        if (!expr) {
            args[0] = "Assertion Failed: " + args[0];
            transportSend("error", args);
        }
    };
}(window._Brackets_LiveDev_Transport, window.console));
