/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, URL, Blob, Response, Request, Headers */

define(function (require, exports, module) {
    "use strict";

    var UrlParams = require("utils/UrlParams").UrlParams;
    var StartupState = require("bramble/StartupState");
    var _ = require("thirdparty/lodash");
    var Async = require("utils/Async");
    var FilerUtils = require("filesystem/impls/filer/FilerUtils");
    var Content = require("filesystem/impls/filer/lib/content");
    var Path = FilerUtils.Path;
    var decodePath = FilerUtils.decodePath;

    var _provider;

    /**
     * Parses URL and look for the GET parameter "cacheType"
     * if cacheType=blob, Blob URLs are used, cacheType=cacheStorage uses Cache Storage.
     * Not specifying a cacheType allows the default to happen.
     */
    function getCacheType() {
        var params = new UrlParams();
        params.parse();
        return params.get("cacheType") || "";
    }

    function fixPath(path) {
        return Path.normalize(decodePath(path));
    }

    /**
     * UrlProviderBase manages mappings between filesystem paths and URLs.
     */
    function UrlProviderBase() {
        this.paths = {};
        this.urls = {};
    }
    UrlProviderBase.prototype.getUrl = function(filename) {
        // NOTE: make sure that we always return the filename unchanged if we
        // don't have a cached URL.  Don't return a normalized, decoded version.
        var url = this.urls[fixPath(filename)];

        // We expect this to exist, if it doesn't,
        // return path back unchanged
        return url || filename;
    };
    UrlProviderBase.prototype.getFilename = function(url) {
        var filename = this.paths[url];

        // We expect this to exist, if it doesn't,
        // return path back unchanged
        if(!filename) {
            return url;
        }
        return filename;
    };


    /**
     * BlobUrlProvider uses Blob URLs in browsers that don't support CacheStorage
     */
    function BlobUrlProvider(warn) {
        UrlProviderBase.call(this);

        this.baseUrl = window.location.href;
        this.shouldRewriteUrls = true;

        // Warn that some network features won't work fully
        if(warn) {
            console.warn("[Bramble] Your browser doesn't support Service Workers and/or CacheStorage. "  +
                         "Some preview features may not work correctly (e.g., dynamic script loading). " +
                         "Consider using a browser that does, see: "                                     +
                         "https://jakearchibald.github.io/isserviceworkerready");
        }

    }
    BlobUrlProvider.prototype = Object.create(UrlProviderBase.prototype);
    BlobUrlProvider.prototype.constructor = BlobUrlProvider;

    BlobUrlProvider.prototype.init = function(callback) {
        _.defer(callback);
    };
    BlobUrlProvider.prototype.clear = function(callback) {
        Object.keys(this.urls).forEach(URL.revokeObjectURL);

        this.urls = {};
        this.paths = {};

        _.defer(callback);
    };
    BlobUrlProvider.prototype.createURL = function(filename, blob, type, callback) {
        var self = this;

        // If there's an existing entry for this, remove it.
        this.remove(filename, function(err) {
            if(err) {
                return callback(err);
            }

            // Now make a new set of cache entries
            var url = URL.createObjectURL(blob);

            self.urls[filename] = url;
            self.paths[url] = filename;

            callback(null, url);
        });
    };
    BlobUrlProvider.prototype.remove = function(path, callback) {
        var urls = this.urls;
        var paths = this.paths;
        var removed = [];

        // If this is a dir path, look for other paths entries below it
        Object.keys(urls).forEach(function(key) {
            var url = urls[key];

            // The first time a file is written, we won't have
            // a stale cache entry to clean up.
            if(!url) {
                return;
            }

            // If this filename matches exactly, or is a root path (i.e., other
            // filenames begin with "<path>/...", remove it. Otherwise just skip.
            if(key === path || key.indexOf(path + "/") === 0) {
                removed.push(key);

                delete urls[key];
                delete paths[url];

                // Delete the reference from memory
                URL.revokeObjectURL(url);
            }
        });

        _.defer(callback, null, removed);
    };
    BlobUrlProvider.prototype.rename = function(oldPath, newPath, callback) {
        var urls = this.urls;
        var paths = this.paths;
        var renamed = [];

        // Deal with filenames and dirs (rename child paths entries below it)
        Object.keys(urls).forEach(function(path) {
            // If this filename matches exactly, or  filenames begin with "<path>/..."
            if(path === oldPath || path.indexOf(oldPath + "/") === 0) {
                var url = urls[path];
                var renamedPath = path.replace(oldPath, newPath);

                urls[renamedPath] = url;
                paths[url] = renamedPath;
                delete urls[path];

                renamed.push({
                    oldPath: oldPath,
                    newPath: renamedPath
                });
            }
        });

        _.defer(callback, null, renamed);
    };


    /**
     * CacheStorageUrlProvider uses CacheStorage and Service Workers in compatible browsers.
     */
    function CacheStorageUrlProvider() {
        UrlProviderBase.call(this);

        this.projectCacheName = Path.join("vfs", StartupState.project("root"));
        this.baseUrl = this.generateVFSUrlForPath(StartupState.project("root")) + "/";
        this.shouldRewriteUrls = false;
    }
    CacheStorageUrlProvider.prototype = Object.create(UrlProviderBase.prototype);
    CacheStorageUrlProvider.prototype.constructor = CacheStorageUrlProvider;

    // We use cache URLs like https://<origin>/dist/vfs/project/root/filename.ext
    CacheStorageUrlProvider.prototype.generateVFSUrlForPath = function(path) {
        var a = document.createElement("a");
        a.href = StartupState.url("base") + "vfs" + path;
        return a.href;
    };

    CacheStorageUrlProvider.prototype.clear = function(callback) {
        var self = this;
        var projectCacheName = self.projectCacheName;

        // Delete existing cache for this root, and recreate empty cache.
        window.caches
            .delete(projectCacheName)
            .then(function() {
                caches.open(projectCacheName).then(function() {
                    self.paths = {};
                    self.urls = {};
                    callback();
                });
            })
            .catch(callback);
    };
    CacheStorageUrlProvider.prototype.init = function(callback) {
        this.clear(callback);
    };
    CacheStorageUrlProvider.prototype.createURL = function(filename, blob, type, callback) {
        var response = new Response(blob, {
            status: 200,
            statusText: "Served from Thimble's Offline Cache"
        });

        var headers = new Headers();
        headers.append("Content-Type", type);

        var url = this.generateVFSUrlForPath(filename);
        var request = new Request(url, {
            method: "GET",
            headers: headers
        });

        this.urls[filename] = url;
        this.paths[url] = filename;

        window.caches
            .open(this.projectCacheName)
            .then(function(cache) {
                cache.put(request, response).then(function() {
                    callback(null, url);
                });
            })
            .catch(callback);
    };
    CacheStorageUrlProvider.prototype.remove = function(path, callback) {
        var self = this;
        var removed = [];

        function _maybeRemove(pathPart) {
            var deferred = new $.Deferred();
            var url = self.urls[pathPart];

            // The first time a file is written, we won't have
            // a stale cache entry to clean up.
            if(!url) {
                return deferred.resolve().promise();
            }

            // If this filename matches exactly, or is a root path (i.e., other
            // filenames begin with "<path>/...", remove it. Otherwise just skip.
            if(pathPart === path || pathPart.indexOf(path + "/") === 0) {
                removed.push(pathPart);

                delete self.urls[pathPart];
                delete self.paths[url];

                window.caches
                    .open(self.projectCacheName)
                    .then(function(cache) {
                        cache.delete(url).then(deferred.resolve);
                    })
                    .catch(deferred.reject);
            } else {
                // Nothing to be done for this path, skip.
                deferred.resolve();
            }

            return deferred.promise();
        }

        // If this is a dir path, look for other paths entries below it
        Async.doSequentially(Object.keys(self.urls), _maybeRemove, false)
             .done(function() {
                 callback(null, removed);
             })
             .fail(callback);
    };
    CacheStorageUrlProvider.prototype.rename = function(oldPath, newPath, callback) {
        var self = this;
        var urls = this.urls;
        var paths = this.paths;
        var projectCacheName = this.projectCacheName;
        var renamed = [];

        function _maybeRename(pathPart) {
            var deferred = new $.Deferred();

            // If this filename doesn't match exactly, or path doesn't begin with "<path>/..."
            if(!(pathPart === oldPath || pathPart.indexOf(oldPath + "/") === 0)) {
                return deferred.resolve().promise();
            }

            var oldUrl = urls[pathPart];
            var renamedPath = pathPart.replace(oldPath, newPath);

            // Get the existing Response, and re-cache it with a new Request
            // which uses the correct path/url.
            window.caches
                .open(projectCacheName)
                .then(function(cache) {
                    cache.match(oldUrl).then(function(response) {
                        var type = Content.mimeFromExt(Path.extname(renamedPath));
                        var headers = new Headers();
                        headers.append("Content-Type", type);

                        var newUrl = self.generateVFSUrlForPath(renamedPath);
                        var request = new Request(newUrl, {
                            method: "GET",
                            headers: headers
                        });

                        urls[renamedPath] = newUrl;
                        paths[newUrl] = renamedPath;

                        cache.put(request, response.clone()).then(function() {
                            self.remove(pathPart, function(err) {
                                if(err) {
                                    return deferred.reject(err);
                                }

                                renamed.push({
                                    oldPath: oldPath,
                                    newPath: renamedPath
                                });

                                deferred.resolve();
                            });
                        });
                    });
                })
                .catch(deferred.reject);

            return deferred.promise();
        }

        // Deal with renaming a file, or a dir (and all children)
        Async.doSequentially(Object.keys(self.urls), _maybeRename, false)
             .done(function() {
                 callback(null, renamed);
             })
             .fail(callback);
    };


    function init(callback) {
        // In the case of a failed service worker installation (often Firefox),
        // we signal that Blob URLs should get used via `window.brambleCacheType`
        // see src/main.js.
        if (window.brambleCacheType === 'blob') {
            _provider = new BlobUrlProvider();
            return _provider.init(callback);
        }

        // Allow overriding the cache type via cacheType=blob or cacheType=cacheStorage
        var cacheTypeOverride = getCacheType();
        switch(cacheTypeOverride) {
        case "blob":
            console.info("[Bramble] Override cache provider: using Blob URLs");
            _provider = new BlobUrlProvider();
            break;
        case "cacheStorage":
            console.info("[Bramble] Override cache provider: using Cache Storage URLs");
            _provider = new CacheStorageUrlProvider();
            break;
        default:
            // Prefer CacheStorage if we have full support, but fallback to Blob URLs
            _provider = ("caches" in window && "serviceWorker" in window.navigator) ?
                new CacheStorageUrlProvider() :
                new BlobUrlProvider(true);
            break;
        }

        _provider.init(callback);
    }

    function remove(path, callback) {
        path = fixPath(path);
        _provider.remove(path, callback);
    }

    function rename(oldPath, newPath, callback) {
        oldPath = fixPath(oldPath);
        newPath = fixPath(newPath);
        _provider.rename(oldPath, newPath, callback);
    }

    function clear(callback) {
        _provider.clear(callback);
    }

    function getBaseUrl() {
        return _provider.baseUrl;
    }

    function getShouldRewriteUrls() {
        return _provider.shouldRewriteUrls;
    }

    function getUrl(filename) {
        // NOTE: we intentionally don't call fixPath() on filename
        return _provider.getUrl(filename);
    }

    // Get a DownloadUrl suitable for the DataTransfer object to allow dragging
    // files out of the browser to OS. See https://www.thecssninja.com/html5/gmail-dragout.
    // Only works in Chrome at present, similar to how attachments in gmail work.
    function getDownloadUrl(filename) {
        var blobUrl = getUrl(filename);
        var basename = Path.basename(filename);
        var ext = Path.extname(filename);
        var mimeType = Content.mimeFromExt(ext);

        return mimeType + ":" + basename + ":" + blobUrl;
    }

    function getFilename(url) {
        return _provider.getFilename(url);
    }

    function createURL(path, data, type, callback) {
        path = fixPath(path);
        var blob = new Blob([data], {type: type});
        _provider.createURL(path, blob, type, callback);
    }

    exports.init = init;
    exports.getBaseUrl = getBaseUrl;
    exports.getShouldRewriteUrls = getShouldRewriteUrls;
    exports.remove = remove;
    exports.rename = rename;
    exports.clear = clear;
    exports.getUrl = getUrl;
    exports.getDownloadUrl = getDownloadUrl;
    exports.getFilename = getFilename;
    exports.createURL = createURL;
});
