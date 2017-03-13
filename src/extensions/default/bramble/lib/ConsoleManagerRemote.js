(function(transport, global, console) {
    "use strict";
    
    function transportSend(args, type) {        
        // To avoid Runtime.evaluate messages
        if(args[0] !== "Runtime.evaluate") {
            transport.send("bramble-console", args, type);
        }
    }
    
    // Implement console.log replacement
    console.log = function() {    
        var args = Array.from(arguments).slice();
        transportSend(args, "log");
    };

    // Implement console.debug replacement
    console.debug = function() {        
        var args = Array.from(arguments).slice();
        transportSend(args, "debug");
    };
    
    // Implement console.error replacement
    console.error = function() {        
        var args = Array.from(arguments).slice();
        transportSend(args, "error");
    }
    
    // Implement console.info replacement
    console.info = function() {
        var args = Array.from(arguments).slice();
        transportSend(args, "info");
    }

    // Implement console.info replacement
    console.warn = function() {
        var args = Array.from(arguments).slice();
        transportSend(args, "warn");
    }
    
    // Implement console.clear replacement
    console.clear = function() {
        var args = Array.from(arguments).slice();
        transportSend(args, "clear");
    }
    
    // Implement console.time replacement
    console.time = function() {
        var args = Array.from(arguments).slice();  
        transportSend(args, "time");
    }
    
        // Implement console.time replacement
    console.timeEnd = function() {
        var args = Array.from(arguments).slice();
        transportSend(args, "timeEnd");
    }
    
    // Replace default console.assert with custom
    console.assert = function() {
        var args = Array.from(arguments).slice();
        var expr = args.shift();
        if (!expr) {
            args[0] = "Assertion Failed: " + args[0];
            transportSend(args, "error");
        }
    };

    global.console = console;

}(window._Brackets_LiveDev_Transport, window, window.console));
