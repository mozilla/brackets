define(function (require, exports, module) {
    "use strict";

    var SimpleWebRTC    = require("simplewebrtc");

    var _webrtc,
        _pending,
        _changing,
        _room,
        _codemirror,
        _cursors;

    function connect() {
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
        
        _pending = []; // pending clients that need to be initialized.
        _cursors = {};
        _changing = false;
        if(_room) {
            console.warn("Room ", _room, ", already joined");
            return;
        }
        //To be moved to the bramble API.
        var query = (new URL(window.location.href)).searchParams;
        _room = query.get("collaboration") || Math.random().toString(36).substring(7);
        console.log(_room);        
        _webrtc.joinRoom(_room, function() {
            _webrtc.sendToAll("new client", {});
            _webrtc.on("createdPeer", _initializeNewClient);

            _webrtc.connection.on('message', _handleMessage);
        });
    };

    function setCodemirror(codemirror) {
        _codemirror = codemirror;
        _codemirror.on("refresh", function() {
            for (var id in _cursors) {
              if (_cursors.hasOwnProperty(id)) {
                var element = document.getElementById(id);
                if(element) {
                    element.parentNode.removeChild(element);
                }
                _codemirror.addWidget(_cursors[id].position, _getCursorElement(id, _cursors[id].color), false, "over");
              }
            }
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
            case "cursor-position":
                var id = msg.sid;
                var color = _getRandomColor();
                if(_cursors[id]) {
                    var element = document.getElementById(id);
                    if(element) {
                        element.parentNode.removeChild(element);
                    }
                    color = _cursors[msg.sid].color;
                }
                _cursors[id] = {position: msg.payload, color: color};
                _codemirror.addWidget({line: msg.payload.line, ch: msg.payload.ch + 1}, _getCursorElement(id, color), false, "over");
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
        var start = _codemirror.indexFromPos(delta.from);
        // apply the delete operation first
        if (delta.removed.length > 0) {
            var delLength = 0;
            for (var i = 0; i < delta.removed.length; i++) {
             delLength += delta.removed[i].length;
            }
            delLength += delta.removed.length - 1;
            var from = _codemirror.posFromIndex(start);
            var to = _codemirror.posFromIndex(start + delLength);
            _codemirror.replaceRange('', from, to);
        }
        // apply insert operation
        var param = delta.text.join('\n');
        var from = _codemirror.posFromIndex(start);
        var to = from;
        _codemirror.replaceRange(param, from, to);
        _changing = false;
    };

    //might be a duplicate
    //TODO : Look for a similar existing function
    function _getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function _getCursorElement(id, color) {
        var d = document.createElement("span");
        var t = document.createTextNode("|");
        t.fontSize = "10px";
        d.appendChild(t);
        d.display = "inline-block";
        d.id = id;
        d.style.backgroundColor= color;
        d.style.color= color;
        return d;
    }

    function triggerCodemirrorChange(changeList) {
        if(_changing) {
            return;
        }
        for(var i = 0; i<changeList.length; i++) {
            _webrtc.sendToAll("codemirror-change",changeList[i]);
        }
    };

    function triggerCodemirrorCursorChange(cursorPosition) {
        _webrtc.sendToAll("cursor-position", cursorPosition);
    };

    exports.connect = connect;
    exports.triggerCodemirrorChange = triggerCodemirrorChange;
    exports.setCodemirror = setCodemirror;
    exports.triggerCodemirrorCursorChange = triggerCodemirrorCursorChange;
});
