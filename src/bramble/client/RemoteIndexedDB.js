/*global define*/
/*jslint bitwise: true */

define([
    "bramble/ChannelUtils",
    "thirdparty/filer/dist/filer.min"
], function(ChannelUtils, Filer) {
    "use strict";

    var Buffer = Filer.Buffer;
    var UUID = ChannelUtils.UUID;
    // Remote callbacks
    var callbackQueue = {};

    function RemoteIndexedDBContext(worker, mode, useTransferables) {
        this.worker = worker;
        this.mode = mode;
        this.useTransferables = useTransferables;
    }

    RemoteIndexedDBContext.prototype.proxyCall = function(method, options, callback) {
        var that = this;
        var id = UUID.generate();
        callbackQueue[id] = callback;
        this.worker.postMessage({
            method: method,
            mode: that.mode,
            callback: id,
            args: options.args
        });
    };

    RemoteIndexedDBContext.prototype.clear = function(callback) {
        this.proxyCall("clear", {args: null}, callback);
    };

    RemoteIndexedDBContext.prototype.getObject = function(key, callback) {
        this.proxyCall("getObject", {args: [key]}, callback);
    };
    RemoteIndexedDBContext.prototype.getBuffer = function(key, callback) {
        this.proxyCall("getBuffer", {args: [key]}, function(err, arrayBuffer) {
            if(err) {
                return callback(err);
            }
            callback(null, new Buffer(arrayBuffer));
        });
    };

    RemoteIndexedDBContext.prototype.putObject = function(key, value, callback) {
        this.proxyCall("putObject", {args: [key, value]}, callback);
    };
    RemoteIndexedDBContext.prototype.putBuffer = function(key, uint8BackedBuffer, callback) {
        var buf;
        if(!Buffer._useTypedArrays) { // workaround for fxos 1.3
            buf = uint8BackedBuffer.toArrayBuffer();
        } else {
            buf = uint8BackedBuffer.buffer;
        }

        this.proxyCall("putBuffer", {args: [key, buf]}, callback);
    };

    RemoteIndexedDBContext.prototype.delete = function(key, callback) {
        this.proxyCall("delete", {args: [key]}, callback);
    };


    function RemoteIndexedDB(name, worker, useTransferables) {
        this.name = name;
        this.worker = worker;
        this.useTransferables = useTransferables;
    }
    RemoteIndexedDB.isSupported = function() {
        // Callers need to check before using this.
        return "maybe";
    };

    RemoteIndexedDB.prototype.open = function(callback) {
        var that = this;

        function run() {
            function remoteCallbackHandler(e) {
                var data = e.data;
                var callback = callbackQueue[data.callback];
                delete callbackQueue[data.callback];
                callback.apply(null, data.result);
            }
            that.worker.addEventListener("message", remoteCallbackHandler, false);

            callback();
        }

        function handleOpen(e) {
            that.worker.removeEventListener("message", handleOpen, false);
            var data = e.data;

            if(data.type !== "OPEN_CALLBACK") {
                return callback(new Error("unexpected worker message: " + e.data.type));
            }

            if(data.err) {
                return callback(data.err);
            }

            run();
        }
        that.worker.addEventListener("message", handleOpen, false);
        that.worker.postMessage({type: "OPEN", name: that.name});
    };
    RemoteIndexedDB.prototype.getReadOnlyContext  = function() {
        return new RemoteIndexedDBContext(this.worker, "readonly", this.useTransferables);
    };
    RemoteIndexedDB.prototype.getReadWriteContext = function() {
        return new RemoteIndexedDBContext(this.worker, "readwrite", this.useTransferables);
    };

    return RemoteIndexedDB;
});
