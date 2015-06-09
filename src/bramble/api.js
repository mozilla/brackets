/*
 * Copyright (c) 2015 Bramble Contributors. All rights reserved.
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

/*global define, HTMLElement, MessageChannel */

define([
    // Change this to filer vs. filer.min if you need to debug Filer
    "thirdparty/filer/dist/filer.min",
    "thirdparty/MessageChannel/ChannelUtils",
    "thirdparty/MessageChannel/message_channel"
], function(Filer, ChannelUtils) {
    "use strict";    

    // PROD URL for Bramble, which can be changed below
    var PROD_BRAMBLE_URL = "https://mozillathimblelivepreview.net/bramble/dist/index.html";

    var FilerBuffer = Filer.Buffer;
    var UUID = ChannelUtils.UUID;

    function parseEventData(data) {
        try {
            data = JSON.parse(data);
            return data || {};
        } catch(err) {
            return {};
        }
    }

    /**
     * The `div` is the element, or id of an element to use when creating
     * the Bramble iframe. All existing contents of this element will be removed:
     *
     * var bramble = new Bramble(someDiv);        // expects someDiv to be an existing element
     * var bramble = new Bramble('#some-div-id'); // selector for element
     * var bramble = new Bramble();               // will use document.body
     * 
     * You can pass various options as well:
     *
     * var bramble = new Bramble({...}); // uses document.body with given options
     * var bramble = new Bramble(elem, {...});
     *
     * Options available include:
     *   url: <String> a URL to use when loading the Bramble iframe (defaults to prod)
     *   locale: <String> the locale Brackets should use
     *   extensions: {
     *       enable: <Array(String)> a list of extensions to enable
     *       disable: <Array(String)> a list of extensions to disable
     *   }
     *   hideUntilReady: <Boolean> whether to hide Bramble until it's fully loaded.
     *   ready: <Function> a function to be called when Bramble is fully loaded.
     *   provider: <Filer.FileSystem.providers.*> a provider to use for the fs, defaults to Memory
     */
    function Bramble(div, options) {
        var self = this;

        // Long-running callbacks for fs watch events
        var watches = {};

        // The channel port for communication with this instance
        var port;

        // The iframe's window, for postMessage
        var brambleWindow;

        // Whether to transfer ownership of ArrayBuffers or not
        var allowArrayBufferTransfer;

        if (typeof div === "object"  && !(div instanceof HTMLElement)) {
            options = div;
            div = null;
        }
        options = options || {};

        var id = self._id = "bramble-" + UUID.generate();

        var provider = options.provider || new Filer.FileSystem.providers.Memory();
        var fs = self.fs = new Filer.FileSystem({provider: provider});

        function startEvents(win) {
            window.addEventListener("message", function(e) {
                var data = parseEventData(e.data);

                // When Bramble asks for initial content, reply but don't bother providing any
                if (data.type === "bramble:init") {
                    win.postMessage(JSON.stringify({type: "bramble:init", source: null}), "*");
                }
                // Listen for requests to setup the fs
                else if (data.type === "bramble:filer") {
                    setupChannel(win);
                }
                // Listen for Bramble to become ready/fully-loaded
                else if (data.type === "bramble:loaded") {
                    if (options.hideUntilReady) {
                        self._iframe.style.visibility = "visible";
                    }
                    if (typeof options.ready === "function") {
                        options.ready();
                    }
                }
            });
        }

        function createIFrame() {
            if (typeof div === "string") {
                div = document.querySelector(div);
            }

            if (!div) {
                div = document.body;
            }

            div.innerHTML = "<iframe id='" + id +
                            "' frameborder='0' width='100%' height='100%'></iframe>";
            
            var iframe = self._iframe = document.getElementById(id);
            if (options.hideUntilReady) {
                iframe.style.visibility = "hidden";
            }

            brambleWindow = iframe.contentWindow;

            startEvents(brambleWindow);

            var search;
            if (options.extensions) {
                // Override the extension list with what's in options
                search = "";

                var enable = options.extensions.enable;
                if (enable && enable.length) {
                    search = "?";
                    search += "enableExtensions=" + enable.join(",");
                }

                var disable = options.extensions.disable;
                if (disable && disable.length) {
                    search += search.length ? "&" : "?";
                    search += "disableExtensions=" + disable.join(",");
                }
            } else {
                // Default to passing whatever is on the hosting window's search string
                search = window.location.search;
            }

            if (options.locale) {
                search += search.length ? "&" : "?";
                search += options.locale;
            }

            // Allow custom URL to Bramble's index.html, default to prod
            iframe.src = (options.url ? options.url : PROD_BRAMBLE_URL) + search;
        }

        if (document.readyState === "complete") {
            createIFrame();
        } else {
            document.addEventListener("DOMContentLoaded", function waitForDOM() {
                document.removeEventListener("DOMContentLoaded", waitForDOM, false);
                createIFrame();
            }, false);
        }

        function setupChannel(win) {
            var channel = new MessageChannel();
            ChannelUtils.postMessage(win,
                                     [JSON.stringify({type: "bramble:filer"}),
                                     "*",
                                     [channel.port2]]);
            port = self._port = channel.port1;
            port.start();

            ChannelUtils.checkArrayBufferTransfer(port, function(err, isAllowed) {
                allowArrayBufferTransfer = isAllowed;
                port.addEventListener("message", remoteFSCallbackHandler, false);                
            });
        }

        function getCallbackFn(id) {
            // If we have a long-running callback (fs.watch()) use that,
            // otherwise generate a new one.
            if(watches[id]) {
                return watches[id];
            }

            return function callback(err, result) {
                var transferable;

                // If the second arg is a Filer Buffer (i.e., wrapped Uint8Array),
                // get a reference to the underlying ArrayBuffer for transport.
                if (FilerBuffer.isBuffer(result)) {
                    result = result.buffer;

                    // If the browser allows transfer of ArrayBuffer objects over
                    // postMessage, add a reference to the transferables list.
                    if (allowArrayBufferTransfer) {
                        transferable = [result];
                    }
                }

                port.postMessage({callback: id, result: [err, result]}, transferable);
            };
        }

        function remoteFSCallbackHandler(e) {
            var data = e.data;
            var method = data.method;
            var callbackId = data.callback;
            var callback = getCallbackFn(callbackId);
            var args = data.args;

            // Most fs methods can just get run normally, but we have to deal with
            // ArrayBuffer vs. Filer.Buffer for readFile and writeFile, and persist
            // watch callbacks.
            switch(method) {
            case "writeFile":
                // Convert the passed ArrayBuffer back to a FilerBuffer
                args[1] = new FilerBuffer(args[1]);
                fs.writeFile.apply(fs, args.concat(callback));
                break;
            case "readFile":
                fs.readFile.apply(fs, args.concat(function(err, data) {
                    // Convert the FilerBuffer to an ArrayBuffer for transport
                    callback(err, data ? data.buffer : null);
                }));
                break;
            case "watch":
                // Persist watch callback until we get an unwatch();
                watches[callbackId] = callback;
                fs.watch.apply(fs, data.args.concat(callback));
                break;
            default:
                fs[data.method].apply(fs, data.args.concat(callback));
            }
        }

        self._executeRemoteCommand = function(options) {
            if (!brambleWindow) {
                console.error("[Bramble Error] No active instance, unable to execute command");
                return;
            }

            options.type = "bramble:remoteCommand";
            brambleWindow.postMessage(JSON.stringify(options), self._iframe.src);
        };
    }

    Bramble.prototype.undo = function() {
        this._executeRemoteCommand({commandCategory: "brackets", command: "EDIT_UNDO"});
    };

    Bramble.prototype.redo = function() {
        this._executeRemoteCommand({commandCategory: "brackets", command: "EDIT_REDO"});
    };

    Bramble.prototype.increaseFontSize = function() {
        this._executeRemoteCommand({commandCategory: "brackets", command: "VIEW_INCREASE_FONT_SIZE"});
    };

    Bramble.prototype.decreaseFontSize = function() {
        this._executeRemoteCommand({commandCategory: "brackets", command: "VIEW_DECREASE_FONT_SIZE"});
    };

    Bramble.prototype.restoreFontSize = function() {
        this._executeRemoteCommand({commandCategory: "brackets", command: "VIEW_RESTORE_FONT_SIZE"});
    };

    Bramble.prototype.save = function() {
        this._executeRemoteCommand({commandCategory: "brackets", command: "FILE_SAVE"});
    };

    Bramble.prototype.saveAll = function() {
        this._executeRemoteCommand({commandCategory: "brackets", command: "FILE_SAVE_ALL"});
    };

    Bramble.prototype.useLightTheme = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_LIGHT_THEME"});
    };

    Bramble.prototype.useDarkTheme = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_DARK_THEME"});
    };

    Bramble.prototype.showSidebar = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_SHOW_SIDEBAR"});
    };

    Bramble.prototype.hideSidebar = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_HIDE_SIDEBAR"});
    };

    Bramble.prototype.refreshPreview = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_RELOAD"});        
    };

    Bramble.prototype.useMobilePreview = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_MOBILE_PREVIEW"});
    };

    Bramble.prototype.useDesktopPreview = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_DESKTOP_PREVIEW"});
    };

    Bramble.prototype.enableJavaScript = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_ENABLE_SCRIPTS"});
    };

    Bramble.prototype.disableJavaScript = function() {
        this._executeRemoteCommand({commandCategory: "bramble", command: "BRAMBLE_DISABLE_SCRIPTS"});
    };

    // We only support having a single instance in the page.
    var _instance;

    // Require version
    return {
        // Expose Filer for Path, Buffer, providers, etc.
        Filer: Filer,
        createInstance: function(div, options) {
            if (!_instance) {
                _instance = new Bramble(div, options);
            }
            return _instance;
        }
    };
});
