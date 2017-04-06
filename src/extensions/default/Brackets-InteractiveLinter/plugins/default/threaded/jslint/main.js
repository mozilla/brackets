/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(require /*, exports, module*/) {
    "use strict";

    var jslint          = require("jslint/libs/jslint");
    var utils           = require("libs/utils");
    var groomer         = require("jslint/groomer");
    var defaultSettings = JSON.parse(require("text!jslint/default.json"));
    var settings        = JSON.parse(require("text!jslint/settings.json"));

    function lint(text, options) {
        var i, length;

        options = utils.mixin({}, defaultSettings, options);

        if (!jslint(text, options)) {
            var errors = jslint.errors.slice(0);

            // If JSHINT.errors is false, then JSHint has some errors it needs to report
            for (i = 0, length = errors.length; i < length; i++) {

                // If an error is empty, it should be the last error in the array which
                // means that the max number of errors was exceeded or there was a fatal
                // error while linting the file
                if (errors[i]) {
                    groomer.groom(errors[i], options);
                }
            }

            return errors;
        }
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
