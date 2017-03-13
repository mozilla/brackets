(function(transport, global, console) {
    "use strict";

    function _log(){
        transport.send("bramble-console", Array.from(arguments).slice());
    }

    // Bind _log to iframe console.
    console.log = _log;

    // Implement other Log Levels to console.log
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;

    // Replace default console.assert with custom
    console.assert = function() {
        var args = Array.from(arguments).slice();
        var expr = args.shift();
        if (!expr) {
            args[0] = "Assertion Failed: " + args[0];
            console.error.apply(console, args);
        }
	};
	
	// Replace default clear console with custom
	console.count = function() {
	console.log(console);
	}

    global.console = console;

}(window._Brackets_LiveDev_Transport, window, window.console));
