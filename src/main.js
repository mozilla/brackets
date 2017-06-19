/*
 * Copyright (c) 2013 - present Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * The bootstrapping module for brackets. This module sets up the require
 * configuration and loads the brackets module.
 */
require.config({
    // Disable module loading timeouts, due to the size of what we load
    waitSeconds: 0,
    paths: {
        "text"              : "thirdparty/text/text",
        "i18n"              : "thirdparty/i18n/i18n",
        "react"             : "thirdparty/react",

        // The file system implementation. Change this value to use different
        // implementations (e.g. cloud-based storage).
        "fileSystemImpl"    : "filesystem/impls/filer/FilerFileSystem",

        "caman"             : "thirdparty/caman/caman.full.min",
        // In various places in the code, it's useful to know if this is a dev vs. prod env.
        // See Gruntfile for prod override of this to config.prod.js.
        "envConfig"         : "bramble/config/config.dev",
        "yjs"               : "../node_modules/yjs/dist/y",
        "y-text"            : "../node_modules/y-text/dist/y-text",
        "y-array"           : "../node_modules/y-array/dist/y-array"
    },
    map: {
        "*": {
            "thirdparty/CodeMirror2": "thirdparty/CodeMirror",
            "thirdparty/react":       "react"
        }
    },
    shim: {
        "caman": {
            exports: "Caman"
        }
    }
});

if (window.location.search.indexOf("testEnvironment") > -1) {
    require.config({
        paths: {
            "preferences/PreferencesImpl": "../test/TestPreferencesImpl"
        },
        locale: "en" // force English (US)
    });
} else {
    /**
     * hack for r.js optimization, move locale to another config call
     *
     * Use custom brackets property until CEF sets the correct navigator.language
     * NOTE: When we change to navigator.language here, we also should change to
     * navigator.language in ExtensionLoader (when making require contexts for each
     * extension).
     */
    var urlLocale = window.location.search && /locale=([^&]+)&?/.exec(window.location.search);
    urlLocale = urlLocale && urlLocale[1] && urlLocale[1].toLowerCase();

    require.config({
        locale: urlLocale || (typeof (brackets) !== "undefined" ? brackets.app.language : window.navigator.language)
    });
}

/**
 * Service Worker offline cache registration. The bramble-sw.js file
 * is generated by Grunt as part of a dist/ build, and will not do anything
 * in dev builds.
 */
if ('serviceWorker' in window.navigator) {
    window.navigator.serviceWorker.register('bramble-sw.js').then(function(reg) {
        "use strict";

        function sendMessage(data) {
            parent.postMessage(JSON.stringify(data), "*");
        }

        // Let the parent frame know that we have updates in the SW cache.
        function updatesAvailable() {
            sendMessage({ type: 'Bramble:updatesAvailable' });
        }

        // Let the parent frame know that we've cached content for offline loading.
        function offlineReady() {
            sendMessage({ type: 'Bramble:offlineReady' });
        }

        reg.onupdatefound = function() {
            var installingWorker = reg.installing;

            installingWorker.onstatechange = function() {
                switch (installingWorker.state) {
                case 'installed':
                    if (window.navigator.serviceWorker.controller) {
                        updatesAvailable();
                    } else {
                        offlineReady();
                    }
                    break;
                case 'redundant':
                    console.error('[Bramble] The installing service worker became redundant.');
                    break;
                }
            };
        };
    }).catch(function(e) {
        "use strict";
        console.error('[Bramble] Error during service worker registration:', e);
    });
}

define(function (require) {
    "use strict";

    // XXXBramble: get the filesystem loading ASAP for connection with parent window
    require(["filesystem/impls/filer/RemoteFiler"], function(RemoteFiler) {
        RemoteFiler.init();
        // Load the brackets module. This is a self-running module that loads and
        // runs the entire application.
        require(["brackets"]);
    });
});
