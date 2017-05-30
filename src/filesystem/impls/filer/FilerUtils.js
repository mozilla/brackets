/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var Buffer          = require("thirdparty/filer/dist/buffer.min");

    // Based on http://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
    // Converts a base64 string representation of binary data to a Buffer
    function base64ToBuffer(base64Str) {
        var binary = window.atob(base64Str);
        var len = binary.length;
        var bytes = new window.Uint8Array(len);
        for(var i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return new Buffer(bytes.buffer);
    }

    exports.base64ToBuffer  = base64ToBuffer;

    // If you need to debug Path or Buffer, change away from .min versions here
    exports.Path = require("thirdparty/filer/dist/path.min");
    exports.Buffer = Buffer;

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
