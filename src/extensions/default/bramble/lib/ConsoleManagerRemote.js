(function(transport, global, console) {
    "use strict";

    function _log(s){
        transport.send("bramble-console", s);
    }

    // Bind _log to iframe console.
    console.log = _log;

    // Implement other Log Levels to console.log
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;

    if (!console.assert) {
        console.assert = function() {
            var args = Array.from(arguments).slice();
            var expr = args.shift();
            if (!expr) {
                args[0] = "Assertion Failed: " + args[0];
                console.error.apply(console,args);
            }
        };
    }

    global.console = console;

}(window._Brackets_LiveDev_Transport, window, window.console));
