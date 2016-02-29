/*global define, Worker, Uint8Array */
/*jslint bitwise: true */

define([
    "thirdparty/filer/dist/filer.min",
    "bramble/client/RemoteIndexedDB"
], function(Filer, RemoteIndexedDB) {
    "use strict";

    // NOTE: I'm using Fallback vs. IndexedDB to keep older Safari happy here.
    var FallbackProvider = Filer.FileSystem.providers.Fallback;
    var FILE_SYSTEM_NAME = "local";
    var indexedDB = window.indexedDB       ||
                    window.mozIndexedDB    ||
                    window.webkitIndexedDB ||
                    window.msIndexedDB;

    /**
     * Prefer to do run IndexedDB on a worker thread, but fall back to main thread.
     */
    function HybridIndexedDB(name) {
        this.name = name || FILE_SYSTEM_NAME;
        this._impl = null;
    }
    HybridIndexedDB.isSupported = function() {
        // We'll either support it in the main thread or a worker
        return !!indexedDB;
    };

    HybridIndexedDB.prototype.open = function(callback) {
        var that = this;
        var numbers = [1, 2, 3, 4];
        var testData = new Uint8Array(numbers);
        var testBuffer = testData.buffer;
        var dbWorker = new Worker("/src/bramble/client/IndexedDBWorker.js");

        function pickImplementation(e) {
            dbWorker.removeEventListener("message", pickImplementation, false);
            var workerSupportsIndexedDB = e.data.supported;

            // Test if we can transfer ArrayBuffers to worker (i.e., did
            // the one we sent make it back in the same form).
            var workerSupportsTransferables;
            try {
                var a = new Uint8Array(numbers);
                var b = new Uint8Array(e.data.buffer);

                workerSupportsTransferables = a.length === b.length &&
                                              a[0] === b[0]         &&
                                              a[1] === b[1]         &&
                                              a[2] === b[2]         &&
                                              a[3] === b[3];
            } catch(err) {
                workerSupportsTransferables = false;
            }

            if(workerSupportsIndexedDB) {
                that._impl = new RemoteIndexedDB(that.name, dbWorker, workerSupportsTransferables);
            } else {
                that._impl = new FallbackProvider(that.name);
                dbWorker.terminate();
                dbWorker = null;
            }

            that._impl.open(callback);
        }
        dbWorker.addEventListener("message", pickImplementation, false);
        // Send a test ArrayBuffer, and transfer ownership so we can see if
        // the browser supports this.
        dbWorker.postMessage({type: "INIT", name: that.name, buffer: testBuffer}, [testBuffer]);
    };

    HybridIndexedDB.prototype.getReadOnlyContext = function() {
        return this._impl.getReadOnlyContext();
    };
    HybridIndexedDB.prototype.getReadWriteContext = function() {
        return this._impl.getReadWriteContext();
    };

    return HybridIndexedDB;
});
