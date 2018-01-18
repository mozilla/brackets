/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(/*require, exports, module*/) {
    "use strict";

    function groom(message) {
        message.message = "Expected: " + message.expected.join(", ") + ". Instead saw: " + message.text + ".";
        message.type    = "error";
        message.token   = {
            start: {
                line: (message.loc.first_line - 1),
                ch: message.loc.first_column
            },
            end: {
                line: (message.loc.last_line - 1),
                ch: message.loc.last_column
            }
        };

        message.pos = {
            line: message.loc.first_line,
            ch: message.loc.first_column + 1
        };
    }

    return {
        groom: groom
    };
});
