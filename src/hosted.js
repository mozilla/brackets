/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, MessageChannel */

require.config({
    paths: {
        "text"              : "thirdparty/text/text",
        "i18n"              : "thirdparty/i18n/i18n"
    }
});

define([
    // Change this to filer vs. filer.min if you need to debug Filer
    "thirdparty/filer/dist/filer.min",
    "thirdparty/MessageChannel/ChannelUtils",
    "thirdparty/MessageChannel/message_channel"
], function(Filer, ChannelUtils) {
    "use strict";

    var FilerBuffer = Filer.Buffer;
    var fs = new Filer.FileSystem({provider: new Filer.FileSystem.providers.Memory()});
    var port;
    var brambleWindow;
    var allowArrayBufferTransfer;

    // Long-running callbacks for fs watch events
    var watches = {};

    function setupChannel() {
        var channel = new MessageChannel();
        ChannelUtils.postMessage(brambleWindow,
                                 [JSON.stringify({type: "bramble:filer"}),
                                 "*",
                                 [channel.port2]]);
        port = channel.port1;
        port.start();

        ChannelUtils.checkArrayBufferTransfer(port, function(err, isAllowed) {
            allowArrayBufferTransfer = isAllowed;
            port.addEventListener("message", remoteFSCallbackHandler, false);
        });
    }

    function parseEventData(data) {
        try {
            data = JSON.parse(data);
            return data || {};
        } catch(err) {
            return {};
        }
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

    $(function() {
        window.addEventListener("message", function(e) {
            var data = parseEventData(e.data);

            // When Bramble asks for initial content, reply but don't bother providing any
            if (data.type === "bramble:init") {
                brambleWindow.postMessage(JSON.stringify({type: "bramble:init", source: null}), "*");
            }
            // Listen for requests to setup the fs
            else if (data.type === "bramble:filer") {
                setupChannel();
            }
        });

        // Load Bramble, passing search params from this window down.
        var bramble = $("#bramble")[0];
        bramble.src = "index.html" + window.location.search;
        brambleWindow = bramble.contentWindow;
    });
});
