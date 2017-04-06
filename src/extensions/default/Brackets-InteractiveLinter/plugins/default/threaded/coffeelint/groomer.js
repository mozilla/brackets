/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(/*require, exports, module*/) {
    "use strict";

    function groom(message /*, options*/) {
        var ch = /^[^\s]+/.exec(message.message)[0].split(':')[2];
        message.type = message.level;
        message.line = message.lineNumber;

        if (message.context) {
            message.message += " - " + message.context;
        }

        if (message.type === "warn") {
            message.type += "ing";
        }

        if (!message.code) {
            if (message.type === "error") {
                message.code = "E000";
            }
            else {
                message.code = "W000";
            }
        }

        message.token = {
            start: {
                line: message.lineNumber - 1,
                ch: ch - 1
            },
            end: {
                line: message.lineNumber - 1,
                ch: ch
            }
        };

        message.pos = {
            line: message.lineNumber,
            ch: ch - 1
        };
    }

    return {
        groom: groom
    };
});

