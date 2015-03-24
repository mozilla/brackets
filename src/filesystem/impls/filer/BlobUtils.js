/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, Blob, URL */

define(function (require, exports, module) {
    "use strict";

    // BlobUtils provides an opportunistic cache for BLOB Object URLs
    // which can be looked-up synchronously.

    var Filer = require("thirdparty/filer/dist/filer");
    var Path  = Filer.Path;

    // 2-way cache for blob URL to path for looking up either way:
    // * urls - paths keyed on blobUrls
    // * blobs - blobUrls keyed on paths
    var urls  = {};
    var blobs = {};

    // Get a mime-type for the given extension, defaulting to
    // application/octent-stream if we don't know what it is.
    function extensionToMime(ext) {
        switch(ext) {
        case ".html":
        case ".htmls":
        case ".htm":
        case ".htx":
            return "text/html";
        case ".ico":
            return "image/x-icon";
        case ".bmp":
            return "image/bmp";
        case ".css":
            return "text/css";
        case ".js":
            return "text/javascript";
        case ".svg":
            return "image/svg+xml";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpe":
        case ".jpeg":
            return "image/jpeg";
        case ".gif":
            return "image/gif";
        // Some of these media types can be video or audio, prefer video.
        case ".mp4":
            return "video/mp4";
        case ".mpeg":
            return "video/mpeg";
        case ".ogg":
        case ".ogv":
            return "video/ogg";
        case ".mov":
        case ".qt":
            return "video/quicktime";
        case ".webm":
            return "video/webm";
        case ".avi":
        case ".divx":
            return "video/avi";
        case ".mpa":
        case ".mp3":
            return "audio/mpeg";
        case ".wav":
            return "audio/vnd.wave";
        default:
            return "application/octet-stream";    
        }
    }

    // Generate a BLOB URL for the given filename and data and cache it
    function cache(filename, data) {
        filename = Path.normalize(filename);

        var type = extensionToMime(Path.extname(filename));
        var blob = new Blob([data], {type: type});
        var url = URL.createObjectURL(blob);

        // If there's an existing entry for this, remove it.
        remove(filename);

        // Now make a new set of cache entries
        blobs[filename] = url;
        urls[url] = filename;
    }

    // Remove the cached BLOB URL for the given filename
    function remove(filename) {
        filename = Path.normalize(filename);

        var url = blobs[filename];
        delete blobs[filename];
        delete urls[url];
    }

    // Update the cached records for the given filename
    function rename(oldPath, newPath) {
        oldPath = Path.normalize(oldPath);
        newPath = Path.normalize(newPath);

        var url = blobs[oldPath];

        blobs[newPath] = url;
        urls[url] = newPath;

        delete blobs[oldPath];
    }

    // Given a filename, lookup the cached BLOB URL
    function getUrl(filename) {
        filename = Path.normalize(filename);

        var url = blobs[filename];

        // We expect this to exist, if it doesn't, warn.
        if(!url) {
            console.log("[Brackets BlobUtils] Error: no blob URL for `" + filename + "`.");
        }

        return url;
    }

    // Given a BLOB URL, lookup the associated filename
    function getFilename(blobUrl) {
        var filename = urls[blobUrl];

        // We expect this to exist, if it doesn't, warn.
        if(!filename) {
            console.log("[Brackets BlobUtils] Error: no path for `" + blobUrl + "`.");
        }

        return filename;
    }

    exports.cache = cache;
    exports.remove = remove;
    exports.rename = rename;
    exports.getUrl = getUrl;
    exports.getFilename = getFilename;
    exports.extensionToMime = extensionToMime;
});
