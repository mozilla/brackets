/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var Async           = require("utils/Async");
    var FileSystem      = require("filesystem/FileSystem");
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

    /**
     * Helper functions for reading and writing files.  Prefer these to fs.readFile/writeFile
     * since it will also trigger a number of higher-level abstractions in Brackets, including
     * URL generation and caching, image resizing, rewriting, etc.
     *
     * You can use these read/write functions with callbacks, or have them return a Promise:
     *
     * 1) FilerUtils.writeFileAsBinary(filename, data, function(err) { ... });
     *
     * 2) FilerUtils.writeFileAsBinary(filename, data)
     *      .done(function() { ... })
     *      .fail(function(err) { ... });
     */

    function _readFile(filename, options, callback) {
        var useCallback = typeof callback === "function";
        var file;

        try {
            file = FileSystem.getFileForPath(filename);
        } catch(err) {
            if(useCallback) {
                return callback(err);
            }
            return new $.Deferred().reject(err).promise();
        }

        // Because we might want the file as UTF8 or Binary, force the File module
        // to re-read the file from disk vs. using whatever is cached.
        options.ignoreCachedContents = true;

        if(typeof callback === "function") {
            file.read(options, callback);
        } else {
            return Async.promisify(file, "read", options);
        }
    }

    function _writeFile(filename, data, options, callback) {
        var useCallback = typeof callback === "function";
        var file;

        try {
            file = FileSystem.getFileForPath(filename);
        } catch(err) {
            if(useCallback) {
                return callback(err);
            }
            return new $.Deferred().reject(err).promise();
        }

        if(typeof callback === "function") {
            file.write(data, options, callback);
        } else {
            return Async.promisify(file, "write", data, options);
        }
    }

    exports.readFileAsUTF8 = function(filename, callback) {
        return _readFile(filename, {encoding: "utf8"}, callback);
    };

    exports.readFileAsBinary = function(filename, callback) {
        return _readFile(filename, {encoding: null}, callback);
    };

    exports.writeFileAsUTF8 = function(filename, data, callback) {
        return _writeFile(filename, data, {encoding: "utf8"}, callback);
    };

    exports.writeFileAsBinary = function(filename, data, callback) {
        return _writeFile(filename, data, {encoding: null}, callback);
    };
});
