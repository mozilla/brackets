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
            autoRequestMedia: false,
            // TODO : Shift this to config.
            url: "localhost:8888"
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
            self.webrtc.on("createdPeer", function(peer) {
                self.initializeNewClient(peer);
            });

            self.webrtc.connection.on('message', function (msg) {
                self.handleMessage(msg);
            });
        });
    };

    Collaboration.prototype.handleMessage = function(msg) {
        switch(msg.type) {
            case "new client":
                this.pending.push(msg.from);
                break;
            case "codemirror-change":
                this.handleCodemirrorChange(msg.payload);
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


    Collaboration.prototype.initializeNewClient = function(peer) {
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
        if(this.changing) {
            return;
        }
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
        if(this.changing) {
            return;
        }
        for(var i = 0; i<changeList.length; i++) {
            this.webrtc.sendToAll("codemirror-change",changeList[i]);
        }
    };

    exports.Collaboration = Collaboration;
});
