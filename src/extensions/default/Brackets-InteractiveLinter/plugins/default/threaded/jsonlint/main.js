/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(require /*, exports, module*/) {
    "use strict";

    require("jsonlint/libs/jsonlint");
    var utils          = require("libs/utils");
    var groomer        = require("jsonlint/groomer");
    var defaultOptions = JSON.parse(require("text!jsonlint/default.json"));
    var settings       = JSON.parse(require("text!jsonlint/settings.json"));
    var lastError      = null;

    // Let's override the parseError method so that we can get access to the object
    // with the details about it.
    jsonlint.parseError = function parseError(str, hash) {
        lastError = hash;
        throw new Error(str);
    };


    function lint(text, options) {
        var errors;
        options = utils.mixin({}, defaultOptions, options);

        try {
            jsonlint.parse(text);
        }
        catch(ex) {
            if (lastError) {
                groomer.groom(lastError);
                errors = [utils.mixin({}, lastError)];
                lastError = null;
            }
        }

        return errors;
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
