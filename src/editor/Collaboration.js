define(function (require, exports, module) {
    "use strict";

    var SimpleWebRTC    = require("simplewebrtc");
    var StartupState    = require("bramble/StartupState");
    var EditorManager   = require("editor/EditorManager");
    var Initializer     = require("editor/Initializer");
    var FileSystemEntry = require("filesystem/FileSystem");
    var DocumentManager = require("document/DocumentManager");

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
        var hash = location.hash.replace(/^#/, "");
        var m = /&?collaboration=([^&]*)/.exec(hash);
        if(m && m[1]) {
            this.room = m[1];
        } else {
            this.room = Math.random().toString(36).substring(7);
        }
        var self = this;
        webrtc.joinRoom("brackets-" + this.room, function() {
            self.webrtc.sendToAll("new client", {});
            self.webrtc.on("createdPeer", function(peer) {
                self.initializeNewClient(peer);
            });

            self.webrtc.connection.on('message', function (msg) {
                self.handleMessage(msg);
            });
        });

        console.log("Link -> http://localhost:8000/src/hosted.html#?collaboration=" + this.room);
        this.webrtc = webrtc;
        this.pending = []; // pending clients that need to be initialized.
        this.changing = false;
    };

    Collaboration.prototype.init = function(codemirror) {
        this.codemirror = codemirror;
    };

    Collaboration.prototype.handleMessage = function(msg) {
        switch(msg.type) {
            case "new client":
                this.pending.push(msg.from);
                break;
            case "codemirror-change":
                this.handleCodemirrorChange(msg.payload);
                break;
            case "initFiles":
                var cm = this.getOpenCodemirrorInstance(msg.payload.path.replace(StartupState.project("root"), ""));
                if(cm) {
                    this.changing = true;
                    cm.setValue(msg.payload.content);
                    this.changing = false;
                    console.log("file changed in codemirror" + msg.payload.path);
                } else {
                    // No cm instance attached to file, need to change directly in indexeddb.
                    var file = FileSystemEntry.getFileForPath(msg.payload.path);
                    if(!file) {
                        return;
                    }
                    file.write(msg.payload.content, {}, function(err) {
                        console.log(err);
                    });
                }
                break;
        }
    };

    Collaboration.prototype.initializeNewClient = function(peer) {
        this.changing = false;
        var self = this;
        Initializer.initialize(function(fileName) {
            var file = FileSystemEntry.getFileForPath(fileName);
            file.read({}, function(err, text) {
                if(!err) {
                    peer.send("initFiles", {path: fileName, content: text});
                }
            });
        });
    };

    Collaboration.prototype.handleCodemirrorChange = function(params) {
        if(this.changing) {
            return;
        }
        var delta = params.delta;
        var relPath = params.path;
        var fullPath = StartupState.project("root") + relPath;
        var cm = this.getOpenCodemirrorInstance(params.path);
        if(!cm) {
            var file = FileSystemEntry.getFileForPath(fullPath);
            var self = this;
            console.log("writting to file which is not open in editor." + file);
            return;
        }
        this.changing = true;
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

    Collaboration.prototype.triggerCodemirrorChange = function(changeList, fullPath) {
        if(this.changing) {
            return;
        }
        var relPath = fullPath.replace(StartupState.project("root"), "");
        for(var i = 0; i<changeList.length; i++) {
            this.webrtc.sendToAll("codemirror-change", {
                delta: changeList[i],
                path: relPath
            });
        }
    };

    Collaboration.prototype.getOpenCodemirrorInstance = function(relPath) {
        var fullPath = StartupState.project("root") + relPath;
        var doc = DocumentManager.getOpenDocumentForPath(fullPath);
        if(doc && doc._masterEditor) {
            return doc._masterEditor._codeMirror;
        }
        return null;
    };

    exports.Collaboration = Collaboration;
});
