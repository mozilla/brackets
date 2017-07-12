define(function (require, exports, module) {
    "use strict";

    var UrlCache         = brackets.getModule("filesystem/impls/filer/UrlCache");
    var FilerUtils       = brackets.getModule("filesystem/impls/filer/FilerUtils");
    var Path             = FilerUtils.Path;
    var Browser          = require("lib/iframe-browser");
    var transport        = require("lib/PostMessageTransport");

    var XHRManagerRemote = require("text!lib/XHRManagerRemote.js");

    function getRemoteScript() {
        // Intercept XHR requests, but only if we're rewriting URLs (e.g., Blob URLs)
        if(UrlCache.getShouldRewriteUrls()) {
            return "<script>\n" + XHRManagerRemote + "</script>\n";
        }
        return "";
    }

    // Whether or not this message is a navigation request from the LinkManagerRemote script.
    function isXHRRequest(message) {
        return message === "XMLHttpRequest";
    }

    // Read the file from disk and send back over transport, as if over network
    function handleXHRRequest(path) {
        var currentDocUrl = Browser.getBrowserIframe().src;
        var currentDocPath = UrlCache.getFilename(currentDocUrl);
        var currentDir = currentDocPath !== currentDocUrl ? Path.dirname(currentDocPath) : currentDocPath;

        path = Path.resolve(currentDir, Path.normalize(path));

        var response = {method: "XMLHttpRequest"};

        // For now, we support text based requests only
        FilerUtils.readFileAsUTF8(path, function(err, data) {
            if(err) {
                if(err.code === "ENOENT") {
                    response.error = "No resource found for `" + path + "`";
                    response.status = 404;
                } else {
                    response.error = "Could not complete the request";
                    response.status = 500;
                }
            } else {
                response.content = data;
            }

            transport.send(null, JSON.stringify(response));
        });
    }

    exports.getRemoteScript = getRemoteScript;
    exports.isXHRRequest = isXHRRequest;
    exports.handleXHRRequest = handleXHRRequest;
});
