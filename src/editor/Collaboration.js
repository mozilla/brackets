define(function (require, exports, module) {
    "use strict";

    var SimpleWebRTC = require("simplewebrtc");

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
    };

    Collaboration.prototype.init = function(codemirror) {
        this.webrtc.joinRoom('thimble');
        this.changing = false;
        this.codemirror = codemirror;
        var self = this;
        this.webrtc.connection.on('message', function (msg) {
            if(msg.type !== "data" || self.changing) {
                return;
            }
            var delta = msg.payload;
            self.changing = true;
            var cm = self.codemirror;
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
            self.changing = false;
        });
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
