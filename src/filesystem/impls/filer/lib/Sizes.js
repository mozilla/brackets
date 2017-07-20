
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define*/

define(function (require, exports, module) {
    "use strict";

    var UNITS = ['B', 'kB', 'MB'];

    var KB = 1000;
    var MB = 1000 * KB;

    // 5MB default size limit for total project size on disk
    var DEFAULT_PROJECT_SIZE_LIMIT = 5 * MB;

    // 3MB size limit for imported files.
    var REGULAR_FILE_SIZE_LIMIT_MB = 3 * MB;

    // 5MB size limit for imported archives (zip & tar)
    var ARCHIVE_FILE_LIMIT_MB = 5 * MB;

    // 12MB size limit for imported image files that can be auto-resized (png, jpg)
    var RESIZABLE_IMAGE_FILE_LIMIT_MB = 12 * MB;

    // 250KB size limit for images we are auto-resizing (our ideal size)
    var RESIZED_IMAGE_TARGET_SIZE_KB = 250 * KB;

    // 20KB +/- of error tolerance when we auto-resize images
    var IMAGE_RESIZE_TOLERANCE_KB = 20 * KB;

    // Pretty print a size in bytes in KB or MB.
    // Based on https://github.com/sindresorhus/pretty-bytes/blob/master/index.js (MIT)
    function formatBytes(num) {
        if(!Number.isFinite(num)) {
            return "?";
        }

        var neg = num < 0;

        if(neg) {
            num = -num;
        }

        if(num < 1) {
            return (neg ? '-' : '') + num + ' B';
        }

        var exponent = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1);
        var numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
        var unit = UNITS[exponent];

        return (neg ? '-' : '') + numStr + ' ' + unit;
    }

    exports.KB = KB;
    exports.MB = MB;
    exports.DEFAULT_PROJECT_SIZE_LIMIT = DEFAULT_PROJECT_SIZE_LIMIT;
    exports.REGULAR_FILE_SIZE_LIMIT_MB = REGULAR_FILE_SIZE_LIMIT_MB;
    exports.ARCHIVE_FILE_LIMIT_MB = ARCHIVE_FILE_LIMIT_MB;
    exports.RESIZABLE_IMAGE_FILE_LIMIT_MB = RESIZABLE_IMAGE_FILE_LIMIT_MB;
    exports.RESIZED_IMAGE_TARGET_SIZE_KB = RESIZED_IMAGE_TARGET_SIZE_KB;
    exports.IMAGE_RESIZE_TOLERANCE_KB = IMAGE_RESIZE_TOLERANCE_KB;
    exports.formatBytes = formatBytes;

    // We track whether or not to do certain filesystem operations based
    // on how large a project is vs. the requested disk capacity.
    var _enforceLimits = false;

    exports.getEnforceLimits = function() {
        return _enforceLimits;
    };

    exports.setEnforceLimits = function(value) {
        _enforceLimits = value;
    };
});
