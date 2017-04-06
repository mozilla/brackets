/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(require /*, exports, module*/) {
    "use strict";

    var utils          = require("libs/utils");
    var jshint         = require("jshint");
    var reacttools     = require("jsx/libs/reacttools");
    var defaultOptions = JSON.parse(require("text!jsx/default.json"));
    var settings       = JSON.parse(require("text!jsx/settings.json"));


    function lint(source, options) {
        options = utils.mixin({}, defaultOptions, options);

        try {
            source = reacttools.transform(source, {harmony: true, es6module: true});
        }
        catch(ex) {
            return [{
                type: "error",
                line: ex.lineNumber,
                message: ex.description,
                token: {
                    start: {
                        line: ex.lineNumber - 1,
                        ch: ex.column ? ex.column - 1 : ex.column
                    },
                    end: {
                        line: ex.lineNumber - 1,
                        ch: ex.column
                    }
                },
                pos: {
                    line: ex.lineNumber,
                    ch: ex.column
                }
            }];
        }

        return jshint.lint(source, options);
    }


    return utils.mixin(settings, {
        lint: lint
    });
});
