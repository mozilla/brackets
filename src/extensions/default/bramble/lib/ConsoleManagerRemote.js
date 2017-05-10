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
            var values = [];
            var args = Array.prototype.slice.call(arguments); 

            // Handle Object Arguments
            for(var i = 0; i < args.length; i++) {
                if(args[i] instanceof Error) {
                    for (var key in args[i]) {
                        values.push(args[i][key]);
                    }
                    args[i] = values;
                    values = [];
                } 
            }
            transportSend(type, args);
        };
    });

    // Implements error handling
    window.addEventListener("error", function(messageOrEvents) {
        var message = messageOrEvents.message;
        var error = messageOrEvents.error || {};
        var line = error.lineNumber || 0;
        var stack = error.stack || "Error Interpretting Stack";
        
        var args = {
            message: message,
            line: line,
            stack: stack
        };

        transportSend("error-handler", args);
    }, false);

    console.assert = function() {
        var args = Array.prototype.slice.call(arguments);
        var expr = args.shift();
        if (!expr) {
            args[0] = "Assertion Failed: " + args[0];
            transportSend(args, "error");
        }
    };
}(window._Brackets_LiveDev_Transport, window.console));
