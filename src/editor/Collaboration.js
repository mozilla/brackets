define(function (require, exports, module) {
    "use strict";

    var SimpleWebRTC    = require("simplewebrtc");

    function Collaboration() {
        var webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" videos
            localVideoEl: 'localVideo',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'remotesVideos',
            // immediately ask for camera access
            autoRequestMedia: false
        });
        this.webrtc = webrtc;
        this.pending = []; // pending clients that need to be initialized.
        this.changing = false;
    };

    Collaboration.prototype.init = function(codemirror) {
        var self = this;
        this.webrtc.joinRoom('thimble', function() {
            self.codemirror = codemirror;
            self.webrtc.sendToAll("new client", {});
            self.addListeners();
        });
    };

    Collaboration.prototype.addListeners = function() {
        var self = this;
        this.webrtc.on("createdPeer", function(peer) {
            self.initialiseNewClient(peer);
        });

        this.webrtc.connection.on('message', function (msg) {
            self.handleMessage(msg);
        });
    };

    Collaboration.prototype.handleMessage = function(msg) {
        if(msg.type === "new client") {
            this.addToPending(msg.from);
        }
        if(this.changing) {
            return;
        }
        if(msg.type === "data") {
            this.handleCodemirrorChange(msg.payload);
        }
        if(msg.type === "initClient") {
            this.initiseEditor(msg.payload);
        }
    };

    Collaboration.prototype.addToPending = function(id) {
        this.pending.push(id);
    };

    Collaboration.prototype.initiseEditor = function(value) {
        this.changing = true;
        this.codemirror.setValue(value);
        this.changing = false;
    };

    Collaboration.prototype.initialiseNewClient = function(peer) {
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

    Collaboration.prototype.handleCodemirrorChange = function(delta) {
        this.changing = true;
        var cm = this.codemirror;
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
        this.changing = false;
    };

    Collaboration.prototype.triggerCodemirrorChange = function(changeList) {
        if(!this.changing) {
            for(var i = 0; i<changeList.length; i++) {
                this.webrtc.sendToAll("data",changeList[i]);
            }
        }
    };

    exports.Collaboration = Collaboration;
});
