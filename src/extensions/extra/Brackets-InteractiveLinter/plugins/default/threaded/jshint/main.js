/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */

define(function(require /*, exports, module*/) {
    "use strict";

    /**
     * BUG: jshint gives the wrong character index when dealing with tabs.
     * https://github.com/jshint/jshint/issues/430
     * I am stuck only expecting correct results when the files uses white
     * spaces. Arrrggh!
     */

    require("jshint/libs/jshint");
    var utils           = require("libs/utils");
    var groomer         = require("jshint/groomer");
    var defaultOptions  = JSON.parse(require("text!jshint/default.json"));
    var settings        = JSON.parse(require("text!jshint/settings.json"));

    function lint(text, options) {
        var i, length;

        options = utils.mixin({}, defaultOptions, options);

        try {
          // Get document as a string to be passed into JSHint
          if (!JSHINT(text, options, options.globals)) {
              var errors = JSHINT.errors.slice(0);

              // If JSHINT.errors is false, then JSHint has some errors it needs to report
              for (i = 0, length = errors.length; i < length; i++) {

                  // If an error is empty, it should be the last error in the array which
                  // means that the max number of errors was exceeded or there was a fatal
                  // error while linting the file
                  if (errors[i]) {
                      delete errors[i].scope; // Some errors have scope, which breaks workers (cannot clone objects)
                      groomer.groom(errors[i], options);
                  }
              }

              return errors;
          }
        }
        catch(ex) {
            console.log(ex.message);
        }
    }

    return utils.mixin(settings, {
        lint: lint
    });
});
