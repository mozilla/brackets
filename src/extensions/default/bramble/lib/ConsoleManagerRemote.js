(function(transport) {
    "use strict";

    //TODO: add support for console.log(one,two, three) arguments

    // Returns a function which calls the specific function in scope
    var bind = function(func, scope, args) {
        var fixedArguments = Array.prototype.slice.call(arguments, 2);
        return function() {
            var args = fixedArguments.concat(Array.prototype.slice.call(arguments, 0));
            (func).apply(scope, args);
        };
    };

    function _log(s){
        //See Note below about fixing transport for 'data'
        transport.send("bramble-console", s);
    }

    // Create Console if not present
    if (!window.console) {
        window.console = ({});
    }

    var console = (window.console);

    // Implement Console Log
    if (!console.log) {
        console.log = ({});
    }

    // Bind _log to iframe console.
    console.log = _log;

    // Implement other Log Levels to console.log
    if (!console.debug) {
        console.debug = console.log;
    }

    if (!console.info) {
        console.info = console.log;
    }

    if (!console.warn) {
        console.warn = console.log;
    }

    if (!console.assert) {
        console.assert = function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var expr = args.shift();
            if (!expr) {
                args[0] = " Assertion Failed: " +args[0];
                console.error.apply(console,args);
            }
        };
    }

    window.console = console;

    // window.console.log = _log;

    // TODO: add support for other methods in console
}(window._Brackets_LiveDev_Transport));
