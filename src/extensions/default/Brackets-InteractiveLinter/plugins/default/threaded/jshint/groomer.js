/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(/*require, exports, module*/) {
    "use strict";

    /**
    * Used for reporting errors.  The name is shorter to more directly match
    * to the code from jshint
    */
    var helper = {
        e: function(message /*, token*/) {
            message.type = "error";
            //console.log("error", message, token);
        },

        /**
        * Used for reporting warnings.  The name is shorter to more directly match
        * to the code from jshint
        */
        w: function(message /*, token*/) {
            message.type = "warning";
            //console.log("warning", message, token);
        }
    };



    function processMessage(message, settings) {
        // Not sure why some characters are at 0...
        if (message.character === 0) {
            message.character = 1;
        }

        var evidence = message.evidence.substr(message.character - 1);
        var index, start, end;

        switch (message.code) {
            case "W032": {
                evidence = ";";
                break;
            }

            case "W033": {
                message.character--;
                evidence = message.evidence.substr(message.character - 1, 1);
                break;
            }

            case "W040": {
                index = evidence.search(/[\s;.]/);
                if (index !== -1) {
                    evidence = evidence.substr(0, index);
                }
                break;
            }

            case "W041": {
                evidence = message.a;
                break;
            }

            case "W051": {
                // Find the last occurence of 'delete' starting from where the
                // error was reported.  Skip six characters because thats how
                // long 'delete' is; we need the string after delete and before
                // where the error was reported...
                end = message.character - 1;

                // Find the first valid charater
                while (/[\w]/.test(message.evidence[end]) === false) {
                    if (end <= 0) {
                        break;
                    }

                    end--;
                }

                // Find the first white space and that should give us our offending
                // token range.
                start = end;
                while (/[\s]/.test(message.evidence[start]) === false) {
                    if (start <= 0) {
                        break;
                    }

                    start--;
                }

                // We have to move one up to get to the beginning of the word because the
                // start marker currently points to the characters that stopped the search
                start++;
                end++;

                evidence = message.evidence.substr(start, end - start);
                message.character = start + 1;
                break;
            }

            case "W055": {
                index = evidence.search(/[(\s;]/);
                if (index !== -1) {
                    evidence = evidence.substr(0, index);
                }
                break;
            }

            case "W086": {
                if (settings.laxcasebreak) {
                    return false;
                }
                break;
            }

            /*
            case "W004":
            case "W015":
            case "W098":
            case "W117": {
                start = message.evidence.lastIndexOf(message.a, message.character);
                message.character = start + 1;
                evidence = message.a;

                break;
            }
            */

            default: {
                if (message.a) {
                    start = message.evidence.lastIndexOf(message.a, message.character);
                    message.character = start + 1;
                    evidence = message.a;
                }

                /* The bit below is obviously much more efficient, but JSHint reports
                * the wrong character position when dealing with tabs.  So I have to
                * manually go through and figure out the proper character position.
                * Somehow W098 also reports the wrong position, whether using tabs or
                * spaces.
                message.character -= message.a.length;
                evidence = message.a;
                */

                break;
            }
        }

        return evidence;
    }


    /**
    * Breaks up the message from jshint into something that can be used
    * by codemirror.
    *
    * @param {Object} message - jshint message
    * @param {Object} settings - jshint settings
    */
    function groom(message, settings) {
        if (!message || !message.evidence) {
            return;
        }

        // Don't inline this call in token because message gets changed in
        // processMessage, so all the message properties will not be correct
        // in the rest of the token
        var text = processMessage(message, settings);

        if (text === false) {
            return;
        }

        var token = {
            start: {
                line: (message.line - 1),
                ch: (message.character - 1)
            },
            end: {
                line: (message.line - 1),
                ch: (message.character - 1) + text.length
            }
        };

        // Get the handler for the code type
        var helperFunction = message.code[0].toLowerCase();

        if (helper[helperFunction]) {
            // Do special handling for the message if a handler exists
            helper[helperFunction](message, token);
        }


        // Add href for help
        message.href    = "http://jslinterrors.com/" + (message.raw || "").replace(/'*\{*(\w*)\}*'*/g, "$1").replace(/\s/g, "-").replace(/\.$/, "").toLowerCase();
        message.message = message.reason + " - " + message.code;
        message.token   = token;

        message.pos = {
            line: message.line,
            ch: message.character
        };
    }

    return {
        groom: groom
    };
});
