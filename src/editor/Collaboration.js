define(function (require, exports, module) {
    "use strict";

    var FileSystem      = require("filesystem/FileSystem");
    var StartupState    = require("bramble/StartupState");
    var SimpleWebRTC    = require("simplewebrtc");
    var Path            = require("filesystem/impls/filer/FilerUtils").Path;
    var EditorManager   = require("editor/EditorManager");

    var _webrtc,
        _pending,
        _changing,
        _room;

    function connect(options) {
        if(_webrtc) {
            console.error("Collaboration already initialized");
            return;
        }
        if(!options.serverUrl) {
            console.error(new Error("A WebRTC server url must be provided to enable collaboration."));
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
            url: options.serverUrl
        });
        if(_room) {
            console.warn("Room ", _room, ", already joined");
            return;
        }
        _room = options.room || Math.random().toString(36).substring(7);
        console.log(_room);
        _webrtc.joinRoom(_room, function() {
            _webrtc.sendToAll("new client", {});
            _webrtc.on("createdPeer", _initializeNewClient);

            _webrtc.connection.on('message', _handleMessage);
        });

        _pending = []; // pending clients that need to be initialized.
        _changing = false;

        FileSystem.on("rename", function(event, oldPath, newPath) {
            var rootDir = StartupState.project("root");
            var relOldPath = Path.relative(rootDir, oldPath);
            var relNewPath = Path.relative(rootDir, newPath);
            _webrtc.sendToAll("file-rename", {oldPath: relOldPath, newPath: relNewPath});
        });
    };

    function _handleMessage(msg) {
        var payload = msg.payload;
        var oldPath, newPath;
        var rootDir = StartupState.project("root");
        switch(msg.type) {
            case "new client":
                _pending.push(msg.from);
                break;
            case "codemirror-change":
                _handleCodemirrorChange(payload);
                break;
            case "file-rename":
                oldPath = Path.join(rootDir, payload.oldPath);
                newPath = Path.join(rootDir, payload.newPath); 
                console.log("renamed " + oldPath + " to " + newPath);
                break;
            case "initClient":
                if(_changing) {
                    return;
                }
                _changing = true;
                EditorManager.getCurrentFullEditor()._codeMirror.setValue(payload);
                _changing = false;
                break;
        }
    };


    function _initializeNewClient(peer) {
        _changing = true;
        for(var i = 0; i<_pending.length; i++) {
            if(_pending[i] === peer.id) {
                peer.send("initClient", EditorManager.getCurrentFullEditor()._codeMirror.getValue());
                _pending.splice(i, 1);
                break;
            }
        }
        _changing = false;
    };

    function _handleCodemirrorChange (params) {
        if(_changing) {
            return;
        }
        var delta = params.delta;
        var relPath = params.path;
        var fullPath = Path.join(StartupState.project("root"), relPath);
        var codemirror = _getOpenCodemirrorInstance(fullPath);

        if(!codemirror) {
            return _handleFileChangeEvent(fullPath, params.delta);
        }
        _changing = true;
        var start = codemirror.indexFromPos(delta.from);
        // apply the delete operation first
        if (delta.removed.length > 0) {
            var delLength = 0;
            for (var i = 0; i < delta.removed.length; i++) {
             delLength += delta.removed[i].length;
            }
            delLength += delta.removed.length - 1;
            var from = codemirror.posFromIndex(start);
            var to = codemirror.posFromIndex(start + delLength);
            codemirror.replaceRange('', from, to);
        }
        // apply insert operation
        var param = delta.text.join('\n');
        var from = codemirror.posFromIndex(start);
        var to = from;
        codemirror.replaceRange(param, from, to);
        console.log("writting to file which is open in editor for path" + fullPath);
        _changing = false;
    };

    function _handleFileChangeEvent(path, change) {
        var file = FileSystem.getFileForPath(path);
        console.log("Should write to file which is not open in editor." + file + "changed " + change);
    };

    function _getOpenCodemirrorInstance(fullPath) {
        var masterEditor = EditorManager.getCurrentFullEditor();
        if(masterEditor.getFile().fullPath === fullPath) {
            return masterEditor._codeMirror;
        }
        return null;
    }

    function triggerCodemirrorChange(changeList, fullPath) {
        if(_changing) {
            return;
        }
        var relPath = Path.relative(StartupState.project("root"), fullPath);
        changeList.forEach(function(change) {
            _webrtc.sendToAll("codemirror-change", {
                delta: change,
                path: relPath
            });
        });
    };

    exports.connect = connect;
    exports.triggerCodemirrorChange = triggerCodemirrorChange;

});
