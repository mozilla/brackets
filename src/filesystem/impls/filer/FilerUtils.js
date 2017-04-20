/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    "use strict";

    // If you need to debug Path or Buffer, change away from .min versions here
    exports.Path = require("thirdparty/filer/dist/path.min");
    exports.Buffer = require("thirdparty/filer/dist/buffer.min");

    // Deal with Brackets encoding filepath URIs
    exports.decodePath = function(path) {
        // Deal with empty/null/undefined URI
        if(!path) {
            return path;
        }

        try {
            return decodeURI(path);
        } catch(e) {
            console.error("[Brackets] couldn't decode malformed path URI", path);
            return path;
        }
    };

    // Normalize '.html', 'html', '.HTML', 'HTML' all to '.html', unless exludePeriod is 'true'
    // then make it just 'html' without the period.
    exports.normalizeExtension = function(ext, excludePeriod) {
        var maybePeriod = excludePeriod ? "" : ".";
        return maybePeriod + ext.replace(/^\./, "").toLowerCase();
    };
});
