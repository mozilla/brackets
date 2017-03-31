/**
 *  Utilities functions related to 3-D parameter matching
 *
 */
define(function (require, exports, module) {
    "use strict";

    var PARAMETERS_3D_REGEX = /( )*(((-)?\d+(\.\d+)?)( )+)*((-)?\d+(\.\d+)?( )*)/g;

    var MODIFIERS = {
        postion: 50,
        scale: 30,
        rotation: 5,
        radius: 50
    }

    /*
     * Returns the scroll modifier corresponding to a parameter.
     * @param {?string} tag : tag corresponding to which modifier
     * is required
     * @return Modifier value
     */
    function getModifier(tag) {
        if(MODIFIERS.hasOwnProperty(tag)) {
            return MODIFIERS[tag];
        }
        return MODIFIER[tag];
    }

    // Define public API
    exports.PARAMETERS_3D_REGEX     = PARAMETERS_3D_REGEX;
    exports.getModifier = getModifier;
});
