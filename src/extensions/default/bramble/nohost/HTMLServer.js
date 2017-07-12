/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets */
define(function (require, exports, module) {
    "use strict";

    var BaseServer              = brackets.getModule("LiveDevelopment/Servers/BaseServer").BaseServer,
        LiveDevelopmentUtils    = brackets.getModule("LiveDevelopment/LiveDevelopmentUtils"),
        Content                 = brackets.getModule("filesystem/impls/filer/lib/content"),
        UrlCache                = brackets.getModule("filesystem/impls/filer/UrlCache"),
        FilerUtils              = brackets.getModule("filesystem/impls/filer/FilerUtils"),
        Path                    = FilerUtils.Path,
        HTMLRewriter            = brackets.getModule("filesystem/impls/filer/lib/HTMLRewriter"),
        CSSRewriter             = brackets.getModule("filesystem/impls/filer/lib/CSSRewriter");

    var Compatibility           = require("lib/compatibility"),
        MouseManager            = require("lib/MouseManager"),
        PostMessageTransport    = require("lib/PostMessageTransport"),
        LinkManager             = require("lib/LinkManager");

    var _shouldUseBlobURL;

    function _isHTML(path) {
        return LiveDevelopmentUtils.isStaticHtmlFileExt(path);
    }

    function _isCSS(path) {
        return Content.isCSS(Path.extname(path));
    }

    function HTMLServer(config) {
        config = config || {};
        BaseServer.call(this, config);
    }

    HTMLServer.prototype = Object.create(BaseServer.prototype);
    HTMLServer.prototype.constructor = HTMLServer;

    HTMLServer.prototype.pathToUrl = function(path) {
        return UrlCache.getUrl(path);
    };

    HTMLServer.prototype.urlToPath = function(url) {
        return UrlCache.getFilename(url);
    };

    HTMLServer.prototype.readyToServe = function () {
        var deferred = new $.Deferred();

        // Decide if we can use Blob URLs or need to document.write()
        Compatibility.supportsIFrameHTMLBlobURL(function(err, shouldUseBlobURL) {
            if(err) {
                console.error("[Brackets HTMLServer] Unexpected error:", err);
                deferred.reject();
            }

            _shouldUseBlobURL = shouldUseBlobURL;
            deferred.resolve();
        });

        return deferred.promise();
    };

    /**
     * Determines if this server can serve local file. LiveDevServerManager
     * calls this method when determining if a server can serve a file.
     * @param {string} localPath A local path to file being served.
     * @return {boolean} true When the file can be served, otherwise false.
     */
    HTMLServer.prototype.canServe = function (localPath) {
        // If we can't transform the local path to a project relative path,
        // the path cannot be served
        if (localPath === this._pathResolver(localPath)) {
            return false;
        }

        // Url ending in "/" implies default file, which is usually index.html.
        // Return true to indicate that we can serve it.
        if (localPath.match(/\/$/)) {
            return true;
        }

        return _isHTML(localPath);
    };

    /**
     * When a livedocument is added (CSS or HTML) to the server cache, make sure live
     * instrumentation is enabled
     */
    HTMLServer.prototype.add = function (liveDocument) {
        if (liveDocument.setInstrumentationEnabled) {
            // enable instrumentation
            liveDocument.setInstrumentationEnabled(true);
        }
        BaseServer.prototype.add.call(this, liveDocument);
    };

    /**
     * If a livedoc exists (HTML or CSS), serve the instrumented version of the file.
     */
    HTMLServer.prototype.serveLiveDocForUrl = function(url, callback) {
        var path = UrlCache.getFilename(url);
        this.serveLiveDocForPath(path, callback);
    };

    HTMLServer.prototype.serveLiveDocForPath = function(path, callback) {
        var server = this;
        var liveDocument = this.get(path);

        function serveCSS(path, css, callback) {
            CSSRewriter.rewrite(path, css, function(err, css) {
                if(err) {
                    callback(err);
                    return;
                }
                UrlCache.createURL(path, css, "text/css", callback);
            });
        }

        function serveHTML(path, html, server, callback) {
            HTMLRewriter.rewrite(path, html, server, function(err, html) {
                if(err) {
                    callback(err);
                    return;
                }

                UrlCache.createURL(path, html, "text/html", function(err, url) {
                    if(err) {
                        callback(err);
                    }

                    // If the browser can't handle a Blob URL, and we have one, send back HTML
                    if(Content.isBlobURL(url) && !_shouldUseBlobURL) {
                        callback(null, html);
                        return;
                    }

                    callback(null, url);
                });
            });
        }

        function serve(body) {
            if(_isHTML(path)) {
                serveHTML(path, body, server, callback);
            } else if (_isCSS(path)) {
                serveCSS(path, body, callback);
            } else {
                callback(new Error("[Brackets HTMLServer] expected .html or .css live doc type:" + path));
            }
        }

        // Prefer the LiveDoc, but use what's on disk if we have to
        if(liveDocument) {
            return serve(liveDocument.getResponseData().body);
        }

        FilerUtils
            .readFileAsUTF8(path)
            .fail(callback)
            .done(function(content) {
                if(!_isHTML(path)) {
                    return serve(content);
                }

                // Since we don't have a LiveDoc (yet) and aren't instrumenting fully,
                // at least inject the necessary remote scripts so preview APIs work.
                var scripts = PostMessageTransport.getRemoteScript(path);
                var scriptsWithEndTag = scripts + "$&";
                var headRegex = new RegExp(/<\/\s*head>/);
                var htmlRegex = new RegExp(/<\/\s*html>/);

                // Try to inject the scripts at the end of the <head> element
                // if it is present
                if(headRegex.test(content)) {
                    content = content.replace(headRegex, scriptsWithEndTag);
                } else if(htmlRegex.test(content)) {
                    // Otherwise add them at the end of the <html> element
                    content = content.replace(htmlRegex, scriptsWithEndTag);
                } else {
                    // Otherwise just add it at the end of the content
                    content += scripts;
                }

                serve(content);
            });
    };

    exports.HTMLServer = HTMLServer;
});
