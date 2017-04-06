/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

//http://eslint.org/demo/
define(function(require /*, exports, module*/) {
    "use strict";

    var utils          = require("libs/utils");
    var groomer        = require("eslint/groomer");
    var eslint         = require("eslint/libs/eslint");
    var defaultOptions = JSON.parse(require("text!eslint/default.json"));
    var settings       = JSON.parse(require("text!eslint/settings.json"));

    function lint(source, options) {
        options = utils.mixin({}, defaultOptions, options);
        var results = [], i, length;

        try {
            results = eslint.verify(source, options);
        }
        catch(ex) {
            console.log(ex.message);
        }

        for (i = 0, length = results.length; i < length; i++) {
            groomer.groom(results[i], options);
        }

        return results;
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
