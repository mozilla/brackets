define(function (require, exports, module) {
    "use strict";

    function Collaboration() {
        var self = this;
        var webrtc = new SimpleWebRTC({
          // the id/element dom element that will hold "our" videos
          localVideoEl: 'localVideo',
          // the id/element dom element that will hold remote videos
          remoteVideosEl: 'remotesVideos',
          // immediately ask for camera access
          autoRequestMedia: true
        });
        this.webrtc = webrtc;
        this.webrtc.on('readyToCall', function () {
          webrtc.joinRoom('thimble');
        });
        this.init();
    };

    Collaboration.prototype.init = function() {
        var self = this;
        self.changing  = false;
        this.webrtc.connection.on('message', function (msg) {
          if(msg.type == "data") {
            var delta = msg.payload;
            if(!self.codemirror || self.changing) {
             return;
            }

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
          }
        });
    };

    Collaboration.prototype.setCodemirror = function(codemirror) {
       this.codemirror = codemirror;
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
