/**
   * Ported from https://github.com/kayahr/console-shim
   * Copyright (c) 2011 Klaus Reimer <k@ailis.de>
   * Licsensed under the MIT License
   */
define(function (require, exports, module) {
    "use strict";

    /**
       * Returns a function which calls the specified function in the specified scope
       * @param {Function} func - The function to call.
       * @param {Object} scope - The scope to call the function in.
       * @param {...*} args - Additional Arguments to pass to the bound function.
       */
    var bind = function(func, scope, args) {
        var fixedArgs = Array.prototype.slice.call(arguments, 2);
        return function() {
            var args = fixedArgs.concat(Array.prototype.slice.call(arguments, 0));
            (/** @type {Function} */ func).apply(scope, args);  
        };
    };

    // Create Console if not present
    if (!window["console"]) {
        /** @type {Console} */
        window.console = ({});
    }

    /** @type {Object} */
    var console = ( window.console);

    // Implement console log if needed
    if (!console["log"]) {
        // use log4javascript if present
        if (window["log4javascript"])
        {
            var log = log4javascript.getDefaultLogger();
            console.log = bind(log.info, log);
            console.debug = bind(log.debug, log);
            console.info = bind(log.info, log);
            console.warn = bind(log.warn, log); 
            console.error = bind(log.error, log);
        } else {
            /** @param {...*} args */
            console.log = ({});
        }
    }

    // Implement other log levels to console.log if missing
    if (!console["debug"]) {
        console.debug = console.log;
    }
    if (!console["info"]) {
        console.info = console.log;
    }
    if (!console["warn"]) {
        console.warn = console.log;
    }
    if (!console["error"]) {
        console.error = console.log;
    }

    // Implement console.assert if missing
    if (!console["assert"]) {
        console["assert"] = function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var expr = args.shift();
            if (!expr) {
                args[0] = "Assertion failed: " + args[0];
                console.error.apply(console, args);
            }
        };
    }

    // Linking console.dir and console.dirxml to the console.log method if missing.
    // Hopefully the browser already logs objects and DOM nodes as a tree.
    if (!console["dir"]) {
        console["dir"] = console.log;
    }
    if (!console["dirxml"]) {
        console["dirxml"] = console.log;
    }
    if (!console["exception"]) {
        console["exception"] = console.error;
    }

    // Implement console.time and console.timeEnd if missing
    if (!console["time"] || !console["timeEnd"]) {
        var timers = {};
        console["time"] = function(id) {
            timers[id] = new Date().getTime();
        }
        console["timeEnd"] = function(id) {
            var start = timers[id];
            if (start) {
                console.log(id + ": " + (new Date().getTime() - start) + "ms");
                delete timers[id];
            }
        };
    }

    // Implement console.table if missing
    if (!console["table"]) {
        console["table"] = function(data, columns) {
            var i, iMax, row, j, jMax, k;
            
            // Do nothing if data has wrong type or no data was specified
            if (!data || !(data instanceof Array) || !data.length) return;
            
            // Auto-calculate columns array if not set
            if (!columns || !(columns instanceof Array)) {
                columns = [];
                for (k in data[0])
                {
                    if (!data[0].hasOwnProperty(k)) continue;
                    columns.push(k);
                }
            }
            
            for (i = 0, iMax = data.length; i < iMax; i += 1){
                row = [];
                for (j = 0, jMax = columns.length; j < jMax; j += 1) {
                    row.push(data[i][columns[j]]);
                }
               
                Function.apply.call(console.log, console, row);
            }
        };
    }
    // Dummy implementations of other console features to prevent error messages
    // in browsers not supporting it.
    if (!console["clear"]) console["clear"] = function() {};
    if (!console["trace"]) console["trace"] = function() {};
    if (!console["group"]) console["group"] = function() {};
    if (!console["groupCollapsed"]) console["groupCollapsed"] = function() {};
    if (!console["groupEnd"]) console["groupEnd"] = function() {};
    if (!console["timeStamp"]) console["timeStamp"] = function() {};
    if (!console["profile"]) console["profile"] = function() {};
    if (!console["profileEnd"]) console["profileEnd"] = function() {};
    if (!console["count"]) console["count"] = function() {};
})();
