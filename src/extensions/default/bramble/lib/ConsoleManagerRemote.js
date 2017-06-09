(function(transport, console) {
    "use strict";

    function transportSend(type, args) {
        var data = {args: args, type: type};
        transport.send("bramble-console", data);
    }

    // console namespace
    var consoleNS = console;

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
        // cache the old binding
        var oldFn = console[type];

        // rebind for our convenience
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

            // and also fall through to the original function
            oldFn.apply(consoleNS, arguments);
        };
    });

    // Implements global error handler for top-level errors
    window.addEventListener("error", function(messageOrEvents) {
        var message = messageOrEvents.message;
        var error = messageOrEvents.error || {};
        var stack = error.stack || "Error Interpretting Stack";

        transportSend("error", [ message, stack ]);
    }, false);

    // cache the old assert binding
    var oldAssert = console.assert;

    // rebind for our convenience
    console.assert = function() {
        var args = Array.prototype.slice.call(arguments);
        var expr = args.shift();

        if (!expr) {
            args[0] = "Assertion Failed: " + args[0];
            transportSend("error", args);
        }

        // and also fall through to the original function
        oldAssert.apply(consoleNS, arguments);
    };
}(window._Brackets_LiveDev_Transport, window.console));
