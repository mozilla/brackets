/**
 *  Utilities functions related to 3-D parameter matching
 *
 */
define(function (require, exports, module) {
    "use strict";

    var PARAMETERS_3D_REGEX = /((-)?\d+(\.\d+)?) ((-)?\d+(\.\d+)?) ((-)?\d+(\.\d+)?)/g;

    // Define public API
    exports.PARAMETERS_3D_REGEX     = PARAMETERS_3D_REGEX;
});
