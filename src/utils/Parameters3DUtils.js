/**
 *  Utilities functions related to 3-D parameter matching
 *
 */
define(function (require, exports, module) {
    "use strict";

    var PARAMETERS_3D_REGEX = /( )*((-)?\d+(\.\d+)?)( )+((-)?\d+(\.\d+)?)( )+((-)?\d+(\.\d+)?( )*)/g;
    var TRANSLATE_STRING = "position";
    var ROTATE_STRING = "rotation";
    var SCALE_STRING = "scale";
    var MODIFIER = [];
    MODIFIER[TRANSLATE_STRING] = 50;
    MODIFIER[SCALE_STRING] = 30;
    MODIFIER[ROTATE_STRING] = 5;

    /*
     * Adds a color swatch to code hints where this is supported.
     * @param {?string} tag : tag corresponding to which modifier
     * is required
     * @return Modifier value
     */
    function getModifier(tag) {
        return MODIFIER[tag];
    }

    // Define public API
    exports.PARAMETERS_3D_REGEX     = PARAMETERS_3D_REGEX;
    exports.getModifier = getModifier;
});
