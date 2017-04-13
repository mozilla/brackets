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
            transportSend(type, args);
        };
    });
    
    console.assert = function() {
        var args = Array.prototype.slice.call(arguments);
        var expr = args.shift();
        if (!expr) {
            args[0] = "Assertion Failed: " + args[0];
            transportSend(args, "error");
        }
    };
}(window._Brackets_LiveDev_Transport, window.console));
