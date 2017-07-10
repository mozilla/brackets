define(function (require, exports, module) {
    "use strict";

    var SimpleWebRTC    = require("simplewebrtc"),
        StartupState    = require("bramble/StartupState");

    var _webrtc;
    var _changing;
    var _pending;
    var _room;

    function initialize(options) {
        if(_webrtc) {
            console.error("Collaboration already initialized");
            return;
        }
        _webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" videos
            localVideoEl: 'localVideo',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'remotesVideos',
            // immediately ask for camera access
            autoRequestMedia: false,
            // TODO : Shift this to config.
            url: options.collaborationUrl
        });
        _room = options.room;
        _webrtc.joinRoom(_room, function() {
            _webrtc.sendToAll("new client", {});
            _webrtc.on("createdPeer", function(peer) {
                _initializeNewClient(peer);
            });

            _webrtc.connection.on('message', function (msg) {
                _handleMessage(msg);
            });
        });
        console.log(_room);
        _pending = []; // pending clients that need to be initialized.
        _changing = false;
    };

    function _handleMessage(msg) {
        switch(msg.type) {
            case "new client":
                _pending.push(msg.from);
                break;
            case "codemirror-change":
                _handleCodemirrorChange(msg.payload);
                break;
            case "initClient":
                if(this.changing) {
                    return;
                }
                this.changing = true;
                this.codemirror.setValue(msg.payload);
                this.changing = false;
                break;
        }
    };

    function _initializeNewClient(peer) {
        this.changing = true;
        for(var i = 0; i<this.pending.length; i++) {
            if(this.pending[i] === peer.id) {
                peer.send("initClient", this.codemirror.getValue());
                this.pending.splice(i, 1);
                break;
            }
        }
        this.changing = false;
    };

    function _handleCodemirrorChange(params) {
        if(_changing) {
            return;
        }
        var delta = params.delta;
        var relPath = params.path;
        var fullPath = StartupState.project("root") + relPath;
        _changing = true;
        var start = cm.indexFromPos(delta.from);
        // apply the delete operation first
        if (delta.removed.length > 0) {
            var delLength = 0;
            for (var i = 0; i < delta.removed.length; i++) {
             delLength += delta.removed[i].length;
            }
            delLength += delta.removed.length - 1;
            var from = cm.posFromIndex(start);
            var to = cm.posFromIndex(start + delLength);
            cm.replaceRange('', from, to);
        }
        // apply insert operation
        var param = delta.text.join('\n');
        var from = cm.posFromIndex(start);
        var to = from;
        cm.replaceRange(param, from, to);
        _changing = false;
    };

    function triggerCodemirrorChange(changeList, fullPath) {
        if(_changing) {
            return;
        }
        var relPath = fullPath.replace(StartupState.project("root"), "");
        for(var i = 0; i<changeList.length; i++) {
            _webrtc.sendToAll("codemirror-change", {
                delta: changeList[i],
                path: relPath
            });
        }
    };

    exports.initialize = initialize;
    exports.triggerCodemirrorChange = triggerCodemirrorChange;
});
