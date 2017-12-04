/**
 * See src/filesystem/impls/filer/UrlCache.js. If the browser supports
 * CacheStorage and Service Worker, we cache request/response pairs
 * for all files in the filesystem.  Each project root gets its own cache,
 * which is named vfs/project/root.
 */

// String comes from src/filesystem/impls/filer/UrlCache.js.  What follows
// the / is a capture group for the user's current locale.
var liveDevUrlRegex = /thimble-sw-vfs-cached-url\/([^/]+)\//;

function liveDevError(locale) {
    "use strict";

    return fetch("/dist/live-dev-error/" + locale + "/error.html")
        .then(function(response) {
            // Fallback to statically cached en-US version if we don't have proper localized one.
            return response.ok ? response : fetch("/dist/live-dev-error/en-US/error.html");
        });
}

self.addEventListener("fetch", function(event) {
    "use strict";

    // Strip params off URL so it will properly match what's in cache
    var url = event.request.url.split(/[?#]/)[0];

    event.respondWith(
        caches.match(url)
        .then(function(response) {
            // Either we have this file's response cached, or we should go to the network
            if(response) {
                return response;
            }

            // We expect to have a cached response for live dev URL requests, so it's
            // odd that we don't.  Return a custom 500 indicating that something's wrong.
            var match = url.match(liveDevUrlRegex);
            if(match) {
                return liveDevError(match[1]);
            }

            // Let this go through to the network
            return fetch(event.request);
        })
        .catch(function(err) {
            console.warn("[Bramble Service Worker Error]: couldn't serve URL", url, err);
            return fetch(event.request);
        })
    );
});
