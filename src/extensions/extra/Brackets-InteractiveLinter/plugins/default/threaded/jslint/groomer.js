/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(require /*, exports, module*/) {
    "use strict";

    var JSLintError = require("jslint/libs/JSLintError");


    /**
    * Breaks up the message from jshint into something that can be used
    * by codemirror.
    *
    * @param message {Object} jshint message
    * @param settings {Object} jshint settings
    */
    function groom(message, settings) {
        var token = new JSLintError(message, settings);
        message.message = message.reason;
        message.type    = message.type || "warning";
        message.href    = "http://jslinterrors.com/" + (message.raw || "").replace(/'*\{*(\w*)\}*'*/g, "$1").replace(/\s/g, "-").replace(/\.$/, "").toLowerCase();
        message.token   = {
            start: token.startPosition,
            end: token.endPosition
        };

        message.pos = {
            line: token.startPosition.line + 1,
            ch: token.startPosition.ch + 1
        };
    }

    return {
        groom: groom
    };
});
