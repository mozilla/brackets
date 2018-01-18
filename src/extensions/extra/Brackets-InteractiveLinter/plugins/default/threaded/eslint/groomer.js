/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function (/*require, exports, module*/) {
    "use strict";

    function getType(message) {
        return (message.fatal || message.severity === 2) ? "error" : "warning";
    }


    /**
     * Generates codemirror tokens.  Also massages the message so that it has the
     * data that interactive linter is expecting in the proper place.
     *
     * @param message {Object} message - A linting result item
     * @param settings {Object} settings - Settings used during the linting step
     */
    function groom(message /*, settings*/) {
        message.type     = getType(message);
        message.evidence = "[" + message.ruleId + "] - " + message.source;
        message.token    = {
            start: {
                line: (message.line - 1),
                ch: (message.column - 1)
            },
            end: {
                line: (message.line - 1),
                ch: (message.column)
            }
        };

        message.pos = {
            line: message.line,
            ch: message.column
        };
    }

    return {
        groom: groom
    };
});
