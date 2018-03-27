/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true, bitwise: true */
/* global addEventListener, window */
(function() {
    "use strict";

    var baseUrl;

    function handleClick(e) {
        var anchor = e.currentTarget;
        var url = anchor.getAttribute("href");
        // Strip base URL if necessary
        url = url.replace(baseUrl, "");
        var element;

        // Deal with <a href=""> and ignore
        if(!(url && url.length)) {
            return false;
        }

        // For local paths vs. absolute URLs, try to open the right file.
        // Special case (i.e., pass through) some common, non-http(s) protocol
        // schemes so they work as expected.
        if(/^(javascript|mailto|data|blob):/.test(url)) {
            return true;
        }

        var pathNav = !(/\:?\/\//.test(url));

        // Deal with <a href="#"> links (ignore them)
        var ignoreAnchor = /^\s*#\s*$/.test(url);

        // `fragmentId` handles the special case of fragment ids in the
        // same html page in preview mode (not tutorial mode)
        var fragmentId = /^\s*#.+/.test(url);

        if(!ignoreAnchor && fragmentId) {
            element = document.querySelector(url) || document.getElementsByName(url.slice(1));
            if(element) {
                element = element[0] || element;
                element.scrollIntoView(true);
            }
        } else if(pathNav && window._Brackets_LiveDev_Transport) {
            window._Brackets_LiveDev_Transport.send("bramble-navigate:" + url);
        } else {
            window.open(url, "_blank");
        }

        e.preventDefault();
    }

    addEventListener("DOMContentLoaded", function init() {
        // Record base href so we can strip it from absolute URLs to filesystem paths (service worker).
        var baseElem = document.querySelector("base");
        baseUrl = baseElem ? baseElem.getAttribute("href") : "";

        // Intercept clicks to <a> in the document.
        var links = document.links;
        var len = links.length;
        var link;

        for(var i=0; i<len; i++) {
            link = links[i];
            // Use an existing onclick handler if it exists, or provide our own.
            link.onclick = (function(userLinkHandler) {
                return function(event) {
                    if(userLinkHandler) {
                        userLinkHandler.call(event.currentTarget, event);
                    }

                    if(!event.defaultPrevented && event.bubbles) {
                        handleClick.call(event.currentTarget, event);
                    }
                };
            }(link.onclick));
        }
    }, false);
}());
