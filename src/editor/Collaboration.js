define(function (require, exports, module) {
    "use strict";

    var FileSystem      = require("filesystem/FileSystem");
    var StartupState    = require("bramble/StartupState");
    var SimpleWebRTC    = require("simplewebrtc");
    var Path            = require("filesystem/impls/filer/FilerUtils").Path;
    var ot              = require("editor/ot").ot;
    var EditorManager   = require("editor/EditorManager");
    var CommandManager  = require("command/CommandManager");

    var _webrtc,
        _pending,
        _changing,
        _room,
        _events,
        _adapter;

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
            _webrtc.sendToAllTogether("new client", {});
            _webrtc.on("createdPeer", _initializeNewClient);

            _webrtc.connection.on('message', _handleMessage);
        });

        _pending = []; // pending clients that need to be initialized.
        _changing = false;
        _events = {};

        FileSystem.on("rename", function(event, oldPath, newPath) {
            var rootDir = StartupState.project("root");
            var relOldPath = Path.relative(rootDir, oldPath);
            var relNewPath = Path.relative(rootDir, newPath);
            _webrtc.sendToAllTogether("file-rename", {oldPath: relOldPath, newPath: relNewPath});
        });

        FileSystem.on("change", function(event, entry, added, removed) {
            var rootDir = StartupState.project("root");
            if(added) {
                added.forEach(function(addedFile) {
                    _webrtc.sendToAllTogether("file-added", {path: Path.relative(rootDir, addedFile.fullPath), isFolder: addedFile.isDirectory});
                });
            }
            if(removed) {
                removed.forEach(function(removedFile) {
                    _webrtc.sendToAllTogether("file-removed", {path: Path.relative(rootDir, removedFile.fullPath), isFolder: removedFile.isDirectory});
                });
            }
        });
    };

    function _handleMessage(msg) {
        var payload = msg.payload;
        var oldPath, newPath, fullPath;
        var rootDir = StartupState.project("root");
        switch(msg.type) {
            case "new client":
                _pending.push(msg.from);
                break;
            case "codemirror-change":
                var relPath = payload.path;
                var fullPath = Path.join(StartupState.project("root"), relPath);
                var codemirror = _getOpenCodemirrorInstance(fullPath);
                if(!codemirror) {
                    return _handleFileChangeEvent(fullPath, payload.delta);
                }
                if(!_adapter || _adapter.path !== fullPath) {
                    setCodeMirror(codemirror, fullPath);
                }

                if(_events[relPath]) {
                    for(var i = _events[relPath].length - 1; i>=0; i--) {
                        _adapter.ignoreNextChange = true;
                        _adapter.applyOperation(_events[relPath][i].inverse.ops);
                    }
                }

                _adapter.applyOperation(JSON.parse(payload.operation));

                if(_events[relPath]) {
                    for(var i = 0; i<_events[relPath].length; i++) {
                        _adapter.ignoreNextChange = true;
                        _adapter.applyOperation(_events[relPath][i].operation.ops);
                    }
                }

                break;
            case "file-rename":
                oldPath = Path.join(rootDir, payload.oldPath);
                newPath = Path.join(rootDir, payload.newPath); 
                console.log("renamed " + oldPath + " to " + newPath);
                break;
            case "file-added":
                if(payload.isFolder) {
                    console.log("made change in folder");
                } else {
                    CommandManager.execute("bramble.addFile", {filename: payload.path, contents: ""});                
                }
                break;
            case "file-removed":
                fullPath = Path.join(rootDir, payload.path);
                if(payload.isFolder) {
                    FileSystem.getDirectoryForPath(fullPath).unlink();
                } else {
                    FileSystem.getFileForPath(fullPath).unlink();
                }
                break;
            case "initClient":
                if(_changing) {
                    return;
                }
                _changing = true;
                EditorManager.getCurrentFullEditor()._codeMirror.setValue(payload);
                _changing = false;
                break;
            case "relay":
                if(_events && _events[payload.path]) {
                    console.log(payload.hash + " " + _events[payload.path][0].hash);
                    if(payload.hash !== _events[payload.path][0].hash) {
                        console.log("Should't be here" + payload);
                    }
                    _events[payload.path].splice(0, 1);
                    console.log("removed event");
                }
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

    function _handleFileChangeEvent(path, change) {
        var file = FileSystem.getFileForPath(path);
        console.log("Should write to file which is not open in editor." + file + "changed " + change);
    };

    function _getRandomHash() {
        return Math.random().toString(36).substring(7);
    }

    function _getOpenCodemirrorInstance(fullPath) {
        var masterEditor = EditorManager.getCurrentFullEditor();
        if(masterEditor.getFile().fullPath === fullPath) {
            return masterEditor._codeMirror;
        }
        return null;
    }

    function _initListeners() {
        _adapter.registerCallbacks({
            change: function(op, inverse, fullPath, changeList) {
                var path = Path.relative(StartupState.project("root"), fullPath);
                console.log("op is " + op + "  " + inverse);
                if(!_events[path]) {
                    _events[path] = [];
                }
                var eventHash = _getRandomHash();
                _events[path].push({operation: op, inverse: inverse, hash : eventHash});

                if(_webrtc) {
                    _webrtc.sendToAllTogether("codemirror-change", {operation: JSON.stringify(op), path: path, delta: changeList, hash: eventHash});
                }
            }
        });
    };

    function triggerCodemirrorChange(changeList, fullPath) {
        if(_changing) {
            return;
        }

        var relPath = Path.relative(StartupState.project("root"), fullPath);
        if(!_events[relPath]) {
            _events[relPath] = [];
            _events[relPath].push({changes: changeList, event: -1});
        } else {
            _events[relPath].push({changes: changeList, event: _events[_events.length-1].events + 1});
        }

        _webrtc.sendToAllTogether("codemirror-change", {changes: changeList, path: relPath});
    };

    function setCodeMirror(codemirror, fullPath) {
        if(_adapter) {
            _adapter.detach();
        }
        _adapter = new ot.CodeMirrorAdapter(codemirror, fullPath);
        _initListeners();
    };

    function getAdapter() {
        return _adapter;
    }

    exports.setCodeMirror = setCodeMirror;
    exports.getAdapter = getAdapter;
    exports.connect = connect;
    exports.triggerCodemirrorChange = triggerCodemirrorChange;

});
