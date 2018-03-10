define(function(require, exports, module) {
    "use strict";

    var DEFAULT_BOX_SHADOW_VALUE = " 0px 0px 0px 0px black";

    var DEFAULT_ORDER_OF_VALUES = ["lengths", "color", "inset"];
    
    var BOX_SHADOW_REGEX = /((-?\d+)(px|em|%)\s+){1,3}?((-?\d+)(px|em|%))(\s+([a-z]+))?(\s+inset)?|(inset\s+)?((-?\d+)(px|em|%)\s+){1,3}?((-?\d+)(px|em|%))(\s+([a-z]+))?|(([a-z]+)\s+)?((-?\d+)(px|em|%)\s+){1,3}?((-?\d+)(px|em|%))(\s+inset)?|(inset\s+)?(([a-z]+)\s+)?((-?\d+)(px|em|%)\s+){1,3}?((-?\d+)(px|em|%))/g;
    
    var LENGTH_REGEX = /(?:(-?\d+)(px|em|%))/g;
    
    var LENGTH_TYPES = ["h-shadow", "v-shadow", "blur", "spread"];
    
    var UNITS = ["px", "em", "%"];

    exports.DEFAULT_BOX_SHADOW_VALUE = DEFAULT_BOX_SHADOW_VALUE;
    exports.DEFAULT_ORDER_OF_VALUES = DEFAULT_ORDER_OF_VALUES;
    exports.BOX_SHADOW_REGEX = BOX_SHADOW_REGEX;
    exports.LENGTH_REGEX = LENGTH_REGEX;
    exports.LENGTH_TYPES = LENGTH_TYPES;
    exports.UNITS = UNITS;
});