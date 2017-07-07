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
            case "initClient":
                if(this.changing) {
                    return;
                }
                this.changing = true;
                EditorManager.getCurrentFullEditor()._codeMirror.setValue(msg.payload);
                this.changing = false;
                break;
            case "initFiles":
                var cm = this.getOpenCodemirrorInstance(msg.payload.path.replace(StartupState.project("root"), ""));
                if(cm) {
                    this.changing = true;
                    cm.setValue(msg.payload.content);
                    this.changing = false;
                    console.log("file changed in codemirror" + msg.payload.path);
                } else {
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
        this.changing = true;
        for(var i = 0; i<this.pending.length; i++) {
            if(this.pending[i] === peer.id) {
                peer.send("initClient", EditorManager.getCurrentFullEditor()._codeMirror.getValue());
                this.pending.splice(i, 1);
                break;
            }
        }
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
            console.log("writting to file" + file);
            /*file.read({}, function(err, text) {
                self.changing = true;
                if(delta.removed.length) {
                    var start = self.indexFromPos(text, delta.from);
                    var delLength = 0;
                    for (var i = 0; i < delta.removed.length; i++) {
                     delLength += delta.removed[i].length;
                    }
                    delLength += delta.removed.length - 1;
                    var from = self.indexFromPos(text, start);
                    var to = self.posFromIndex(text, start + delLength);
                    text = self.replaceRange(text, '', self.posFromIndex(text, start), to);
                }
                var param = delta.text.join('\n');
                var from = self.posFromIndex(text, start);
                var to = from;
                text = self.replaceRange(text, param, from, to);
                file.write(text, {}, function(err) {
                    console.log(err);
                });
                self.changing = false;
            });*/
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

    Collaboration.prototype.replaceRange = function(text, param, from, to) {
        //Assuming change in same line
        var lines = text.split("\n");
        //return text.slice(0, from) + param + text.slice( to, this.indexFromPos({line: text.length, ch: text[text.length - 1].length }));
        if(from.line  === to.line) {
            lines[from.line] = lines[from.line].slice(0, from.ch) + param + lines[from.line].slice(to.ch, lines[from.line].length);
        } else {
            lines[from.line] = lines[from.line].slice(0, from.ch);
            lines[to.line] = lines[to.line].slice(to.ch, text[from.line].length);
        }
        for(var i = from.line + 1; i<to.line; i++) {
            lines.splice(from.line + 1, 1);
        }
        return lines.join("\n");
    };

    Collaboration.prototype.indexFromPos = function(text, pos) {
        var ch = 0;
        var lines = text.split("\n");
        for(var i = 0; i<pos.line; i++) {
            ch += (lines[i].length);
        }
        ch += pos.ch;
        return ch;
    };

    Collaboration.prototype.getOpenCodemirrorInstance = function(relPath) {
        var fullPath = StartupState.project("root") + relPath;
        var doc = DocumentManager.getOpenDocumentForPath(fullPath);
        if(doc && doc._masterEditor) {
            return doc._masterEditor._codeMirror;
        }
        return null;
    };

    Collaboration.prototype.posFromIndex = function(text, index) {
        var i = 0;
        text = text.split("\n");
        try {
            while(index>text[i].length) {
                i++;
                index-=text[i].length;
            }
        } catch (e) {
            console.log("exception : "+e);
        }
        return {line: i, ch: index};
    };

    exports.Collaboration = Collaboration;
});
