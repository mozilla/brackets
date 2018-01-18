/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

// JSHINT will create a window object if one does not exist, but
// I will just create one if one does not exist in case JSHINT loads
// after coffeelint
var window = window || {};

define(function(require /*, exports, module*/) {
    "use strict";

    var utils          = require("libs/utils");
    var groomer        = require("coffeelint/groomer");
    var defaultOptions = JSON.parse(require("text!coffeelint/default.json"));
    var settings       = JSON.parse(require("text!coffeelint/settings.json"));

    // Crazy hacks...
    // JSHINT will insert a fake window object...  This completely throws off coffeelint
    // because coffeelint blindly checks to see if window is defined and then it assumes
    // that it is a valid window object...
    if (window) {
        window.addEventListener = window.addEventListener || function(){};
    }

    var coffeelint = {lint: function() {}};
    require(["coffeelint/libs/coffee-script-1.9.1"], function(coffeescript) {
        if (window) {
            window.CoffeeScript = coffeescript;
        }

        require(["coffeelint/libs/coffeelint"], function(linter) {
            coffeelint = linter;
        });
    });


    function lint(text, options) {
        options = utils.mixin({}, defaultOptions, options);
        var result;

        try {
            result = coffeelint.lint(text, options);
            for (var iresult in result) {
                groomer.groom(result[iresult], options);
            }
        }
        catch(ex) {
            console.log(ex.message);
        }

        return result;
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
