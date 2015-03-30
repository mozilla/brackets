/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, URL */

define(function (require, exports, module) {
    "use strict";

    var Handlers = require("filesystem/impls/lib/handlers");
    var Log = require("filesystem/impls/lib/log");

    // BlobUtils provides an opportunistic cache for BLOB Object URLs
    // which can be looked-up synchronously.

    var Filer = require("filesystem/impls/filer/BracketsFiler");
    var Path  = Filer.Path;

    // 2-way cache for blob URL to path for looking up either way:
    // * paths - paths keyed on blobUrls
    // * blobs - blobUrls keyed on paths
    var paths  = {};
    var blobURLs = {};

    // Generate a BLOB URL for the given filename and cache it
    function cache(filename, callback) {
        filename = Path.normalize(filename);

        Handlers.handleFile(filename, function(err, url) {
            // If there's an existing entry for this, remove it.
            remove(filename);

            // Now make a new set of cache entries
            blobURLs[filename] = url;
            paths[url] = filename;

            callback(err);
        });
    }

    // Remove the cached BLOB URL for the given filename
    function remove(filename) {
        filename = Path.normalize(filename);

        var url = blobURLs[filename];
        delete blobURLs[filename];
        delete paths[url];
        // Delete the reference from memory
        URL.revokeObjectURL(url);
    }

    // Update the cached records for the given filename
    function rename(oldPath, newPath) {
        oldPath = Path.normalize(oldPath);
        newPath = Path.normalize(newPath);

        var url = blobURLs[oldPath];

        blobURLs[newPath] = url;
        paths[url] = newPath;

        delete blobURLs[oldPath];
    }

    // Given a filename, lookup the cached BLOB URL
    function getUrl(filename) {
        filename = Path.normalize(filename);

        var url = blobURLs[filename];

        // We expect this to exist, if it doesn't, warn.
        if(!url) {
            Log.error("no blob URL for `" + filename + "`.");
            return filename;
        }

        return url;
    }

    // Given a BLOB URL, lookup the associated filename
    function getFilename(blobUrl) {
        var filename = paths[blobUrl];

        // We expect this to exist, if it doesn't, warn.
        if(!filename) {
            Log.error("no path for `" + blobUrl + "`.");
            return blobUrl;
        }

        return filename;
    }

    exports.cache = cache;
    exports.remove = remove;
    exports.rename = rename;
    exports.getUrl = getUrl;
    exports.getFilename = getFilename;
});
