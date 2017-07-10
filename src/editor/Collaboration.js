define(function (require, exports, module) {
    "use strict";

    var SimpleWebRTC    = require("simplewebrtc");

    var _webrtc,
        _pending,
        _changing,
        _room,
        _codemirror;

    function initialize() {
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
            url: "localhost:8888"
        });
        //To be moved to the bramble API.
        var query = (new URL(window.location.href)).searchParams;
        _room = query.get("collaboration") || Math.random().toString(36).substring(7);
        console.log(_room);
        _pending = []; // pending clients that need to be initialized.
        _changing = false;
    };

    function init(codemirror) {
        _webrtc.joinRoom(_room, function() {
            _codemirror = codemirror;
            _webrtc.sendToAll("new client", {});
            _webrtc.on("createdPeer", function(peer) {
                _initializeNewClient(peer);
            });

            _webrtc.connection.on('message', function (msg) {
                _handleMessage(msg);
            });
        });
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
                if(_changing) {
                    return;
                }
                _changing = true;
                _codemirror.setValue(msg.payload);
                _changing = false;
                break;
        }
    };


    function _initializeNewClient(peer) {
        _changing = true;
        for(var i = 0; i<_pending.length; i++) {
            if(_pending[i] === peer.id) {
                peer.send("initClient", _codemirror.getValue());
                _pending.splice(i, 1);
                break;
            }
        }
        _changing = false;
    };

    function _handleCodemirrorChange (delta) {
        if(_changing) {
            return;
        }
        _changing = true;
        var cm = _codemirror;
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

    function triggerCodemirrorChange(changeList) {
        if(_changing) {
            return;
        }
        for(var i = 0; i<changeList.length; i++) {
            _webrtc.sendToAll("codemirror-change",changeList[i]);
        }
    };

    exports.initialize = initialize;
    exports.triggerCodemirrorChange = triggerCodemirrorChange;
    exports.init = init;

});
