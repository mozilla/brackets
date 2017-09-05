define(function (require, exports, module) {
    "use strict";

    var FileSystem      = require("filesystem/FileSystem");
    var StartupState    = require("bramble/StartupState");
    var SimpleWebRTC    = require("simplewebrtc");
    var Path            = require("filesystem/impls/filer/FilerUtils").Path;
    var EditorManager   = require("editor/EditorManager");
    var CommandManager  = require("command/CommandManager");
    var FilerUtils      = require("filesystem/impls/filer/FilerUtils");
    var DocumentManager = require("document/DocumentManager");
    var FilerUtils      = require("filesystem/impls/filer/FilerUtils"); 
    var BracketsFiler   = require("filesystem/impls/filer/BracketsFiler");

    var _webrtc,
        _changing,
        _room,
        _received = {}, // object to keep track of a file being received to make sure we dont emit it back.
        _renaming,
        _fs,
        _buffer,
        _initialized,
        _receiveQueue,
        _deletedRemotely;

    var TIME = 5000; // time in mili seconds after which the file buffer should be cleared

    /**
     * Called to initialize a WebRTC connection.
     * @param : options : {serverUrl : Url to the WebRTC Turn Server, room : Unique identifier of the room to connect to} 
     */
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
        _fs = BracketsFiler.fs();
        _webrtc.joinRoom(_room, function() {
            if(_webrtc.getPeers().length > 0) {
                var rootDir = StartupState.project("root");
                _fs.ls(rootDir, {}, function(err, entries) {
                    if(err) {
                        console.log(err);
                        return;
                    }

                    var paths = entries.map(function(entry) {
                        var fullPath = Path.join(rootDir, entry.path);
                        return entry.type === "DIRECTORY" ? fullPath.replace(/\/?$/, "/") : fullPath;
                    });
                    _removeLocally(paths)
                        .then(function() {
                            _webrtc.sendToAll('initialize-me', true);
                        })
                        .fail(function(err) {
                            console.log(err);
                        });
                });
            }

            _webrtc.connection.on('message', _handleMessage);
        });

        _changing = false;
        _renaming = {};
        _buffer = {};
        _initialized = {};
        _deletedRemotely= {};
        _receiveQueue = [];

        window.setInterval(_clearBuffer, TIME);
        FileSystem.on("rename", function(event, oldPath, newPath) {
            if(_renaming[oldPath]) {
                delete _renaming[oldPath];
                return;
            }
            var rootDir = StartupState.project("root");
            var relOldPath = Path.relative(rootDir, oldPath);
            var relNewPath = Path.relative(rootDir, newPath);
            _webrtc.sendToAll("file-rename", {oldPath: relOldPath, newPath: relNewPath});
        });

        FileSystem.on("change", function(event, entry, added, removed) {
            var rootDir = StartupState.project("root");
            if(added) {
                added.forEach(function(addedFile) {
                    _sendFileViaWebRTC(addedFile);
                });
            }
            if(removed) {
                removed.forEach(function(removedFile) {
                    var relPath = Path.relative(rootDir, removedFile.fullPath);
                    if(_deletedRemotely[removedFile.fullPath]) {
                        delete _deletedRemotely[removedFile.fullPath];
                        return;
                    }
                    _webrtc.sendToAll("file-removed", {path: relPath, isFolder: removedFile.isDirectory});
                });
            }
        });
    };

    /**
     * Remove the set of files contained int the found array
     * This method doesn't emit these delete events to connected clients.
     * @param : found : Array containing the file paths to be deleted.
     * expects a '/' in the end for foler.
     */
    function _removeLocally(found) {
        if(found.length === 0) {
            return (new $.Deferred()).resolve().promise();
        }

        var fullPath = found.shift();
        return _removeLocally(found)
            .then(function() {
                return _removeFile(fullPath, fullPath.endsWith('/'));
            });
    }


    /**
     * Handles events received from remote clients
     * @param : msg : {type : to identify the type of event, payload : data associated with the data}
     */
    function _handleMessage(msg) {
        var payload = msg.payload;
        var fullPath, oldPath, newPath;
        var rootDir = StartupState.project("root");
        switch(msg.type) {
            case "codemirror-change":
                payload.changes.forEach(function(delta) {
                    _handleCodemirrorChange(delta, payload.path);
                });
                break;
            case "file-rename":
                oldPath = Path.join(rootDir, payload.oldPath);
                newPath = Path.join(rootDir, payload.newPath);
                _renaming[oldPath] = true;
                CommandManager.execute("bramble.renameFile", {dirName: Path.dirname(oldPath), from: Path.basename(oldPath), to: Path.basename(newPath)})
                    .error(function(err) {
                        console.log(err);
                    });
                break;
            case "file-added":
                _received[payload.path] = true;
                if(payload.isFolder) {
                    CommandManager.execute("bramble.addFolder", {filename: payload.path});
                } else {
                    CommandManager.execute("bramble.addFile", {filename: payload.path, contents: payload.text});
                }
                break;
            case "file-removed":
                var fullPath = Path.join(rootDir, payload.path);
                _removeFile(fullPath, payload.isFolder);
                break;
            case "initialize-file":
                if(_initialized[payload.path]) {
                    if(!payload.fromCodemirror) {
                        return;
                    }
                }

                _received[payload.path] = true;
                _initialized[payload.path] = true;
                _receiveQueue.push(payload);

                if(_receiveQueue.length === 1) {
                    _startInitializingfiles(_receiveQueue[0]);
                }
                break;
            case "initialize-me":
                if(_webrtc.getPeers(msg.from)[0]) {
                    _initializeNewClient(_webrtc.getPeers(msg.from)[0]);
                } else {
                    console.log("Client " + msg.from + " Not found");
                }
        }
    };

    /**
     * Function to start initializing the file system sequentially in order of files
     * received from the connected peers.
     * Using a sequential approach to make sure we don't initialize a file inside a folder
     * before the folder is made.
     */
    function _startInitializingfiles(payload) {
        if(payload.isFolder) {
            CommandManager.execute("bramble.addFolder", {filename: payload.path})
            .always(function() {
                _receiveQueue.splice(0, 1);
                if(_receiveQueue.length > 0) {
                    _startInitializingfiles(_receiveQueue[0]);
                }
            });
        } else {
            CommandManager.execute("bramble.addFile", {filename: payload.path, contents: payload.text})
            .always(function() {
                _receiveQueue.splice(0, 1);
                if(_receiveQueue.length > 0) {
                    _startInitializingfiles(_receiveQueue[0]);
                }
            });
        }
    }

    /**
     * Function that recursively walks through all fils and folders to initialize a 
     * newly connected peer.
     */
    function _initializeNewClient(peer) {
        _fs.ls(StartupState.project("root"), { recursive: true }, function(err, entries) {
            if(err) {
                console.log(err);
                return;
            }

            function processPath(fullPath) {
                var cm = _getOpenCodemirrorInstance(fullPath);
                var relPath = Path.relative(StartupState.project("root"), fullPath);
                if(cm) {
                    peer.send('initialize-file', {path: relPath, text: cm.getValue(), isFolder: false, fromCodemirror: true});
                } else {
                    _sendFileViaWebRTC(FileSystem.getFileForPath(fullPath), peer, 'initialize-file');
                }

            }

            function processEntries(parentPath, entries) {
                entries.forEach(function(entry) {
                    var fullPath = Path.join(parentPath, entry.path);
                    if(entry.type !== 'DIRECTORY') {
                        processPath(fullPath);
                    } else {
                        processPath(fullPath.replace(/\/?$/, "/"));
                        processEntries(fullPath, entry.contents);
                    }
                });
            }

            processEntries(StartupState.project("root"), entries);
        });
        
        peer.on("fileTransfer", function (metadata, receiver) {
            console.log("incoming filetransfer", metadata.name, metadata);
            receiver.on("progress", function (bytesReceived) {
                //TODO:: Add UI element to show percentage of file received.
                console.log("Percentage of file received : " + (bytesReceived / metadata.size * 100));
            });
            receiver.on("receivedFile", function (file, metadata) {
                receiver.channel.close();
                var reader = new window.FileReader();
                reader.onload = function(e) {
                    var data = e.target.result;
                    var buffer = new FilerUtils.Buffer(data);
                    var filename = Path.join(StartupState.project("root"), metadata.name);
                    //keep this file in the received array to make sure we don't emit back this file.
                    _received[metadata.name] = true;
                    FilerUtils.writeFileAsBinary(filename, buffer, function(err) {
                        if(err) {
                            // TODO :: Ask the user for the file again.
                            console.log(err);
                        };
                    });
                };
                reader.readAsArrayBuffer(file);
            });
        });
    };

    /**
     * Function to remove a file/folder that was deleted by a connected peer.
     * @param : fullPath : absolute path to the file to be deleted
     * @param : isFolder : Boolean 
     */
    function _removeFile(fullPath, isFolder) {
        var result = new $.Deferred();
        _deletedRemotely[fullPath] = true;
        var fnName = isFolder ? "getDirectoryForPath" : "getFileForPath";
        FileSystem[fnName](fullPath).unlink(function(err) {
            if(err) {
                result.reject(err);
            }
            result.resolve();
        });
        return result.promise();
    }

    /**
     * Function to apply changes made in a peer's editor to the current brackets instance.
     * If we have a codemirror instance open for the file, we apply the changes directly to it.
     * Else we push to a buffer that keeps track of the changes made in the file by other clients
     * and applies those changes directly to the filesystem every TIME seconds, or whenever the user
     * opens that file.
     */
    function _handleCodemirrorChange(delta, relPath) {
        if(_changing) {
            return;
        }
        var fullPath = Path.join(StartupState.project("root"), relPath);
        var codemirror = _getOpenCodemirrorInstance(fullPath);

        if(!codemirror) {
            return _handleFileChangeEvent(fullPath, delta);
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
        if(!_buffer[path]) {
            _buffer[path] = [];
        }
        _buffer[path].push(change);
    };

    function _clearBuffer() {
        for(var path in _buffer) {
            if(_buffer[path].length > 0) {
                applyDiffsToFile(path);
            }
        }
    }

    /**
     * Applies all the changes kept in the buffer array that have occured on connected clients but have not
     * yet been written to the filesystem for this file.
     *
     * @param {!string} path
     * @return {$.Promise} A promise object that will be resolved when the buffer array for the file
     * is cleared or rejected with a FileSystemError if the file is not yet open and can't be read from disk.
     */
    function applyDiffsToFile(path) {
        var result = new $.Deferred();
        if(!_webrtc || !_buffer || !_buffer[path] || _buffer[path].length === 0) {
            FilerUtils.readFileAsUTF8(path)
                .done(function(text, stats) {
                    result.resolve(text, stats.mtime);
                })
                .fail(function(err) {
                    result.reject(err);
                });
            return result.promise();
        }

        var file = FileSystem.getFileForPath(path);
        FilerUtils.readFileAsUTF8(path)
            .done(function (text, stats) {
                var numberOfChanges = 0;
                _buffer[path].forEach(function(delta) {
                    numberOfChanges++;
                    var start = _indexFromPos(delta.from, text);
                    // apply the delete operation first
                    if (delta.removed.length > 0) {
                        var delLength = 0;
                        for (var i = 0; i < delta.removed.length; i++) {
                         delLength += delta.removed[i].length;
                        }

                        delLength += delta.removed.length - 1;
                        var from = _posFromIndex(start, text);
                        var to = _posFromIndex(start + delLength, text);
                        text = _replaceRange('', from, to, text);
                    }

                    // apply insert operation
                    var param = delta.text.join('\n');
                    var from = _posFromIndex(start, text);
                    var to = from;
                    text = _replaceRange(param, from, to, text);
                });

                FilerUtils.writeFileAsUTF8(path, text)
                    .done(function() {
                        console.log("writting to file which is not open in editor for path " + path);
                        _buffer[path].splice(0, numberOfChanges);
                        result.resolve(text, stats.mtime);
                    })
                    .fail(function(err) {
                        result.reject(err);
                    });
            })
            .fail(function (fileError) {
                result.reject(fileError);
            });

        return result.promise();
    }

    /**
     * Returns a codemirror instance associated with the file identified by the parameter
     * Returns null if the file is not open in a codemirror instance and resides only in the filesystems
     * @param {String} : Absolute path to the file
     */
    function _getOpenCodemirrorInstance(fullPath) {
        var doc = DocumentManager.getOpenDocumentForPath(fullPath);
        if(doc && doc._masterEditor) {
            return doc._masterEditor._codeMirror;
        }
        return null;
    }

    function _indexFromPos(coords, text) {
        var textArr = text.split("\n");
        coords = _clipPos(coords, text);
        var index = 0;
        for(var i = 0; i<coords.line; i++) {
            index += (textArr[i].length + 1);
        }
        return (index + coords.ch);
    }

    function _posFromIndex(index, text) {
        var textArr = text.split("\n");
        if(index <= 0) {
            return {line: 0, ch: 0};
        }
        if(index > _indexFromPos({line: textArr.length - 1, ch: textArr[textArr.length - 1].length}, text)) {
            return {line: textArr.length - 1, ch: textArr[textArr.length - 1].length};
        }
        var i = 0;
        while(index >= (textArr[i].length + 1)) {
            index -= (textArr[i].length+1);
            i++;
        }
        return {line: i, ch: index};
    }

    function _replaceRange(params, from, to, text) {
        var start = _indexFromPos(from, text);
        var end = _indexFromPos(to, text);
        return text.substr(0, start) + params + text.substr(end);
    }

    function _clipPos(pos, text) {
        text = text.split("\n");
        if(pos.line < 0) {
            return {pos: 0, line: 0};
        } else if (pos.line >= text.length) {
            return {ch: text[text.length - 1].length, line: text.length - 1};
        }
        if(pos.ch < 0) {
            return {ch: 0, line: pos.line};
        } else if (pos.ch > text[pos.line].length) {
            return {ch: text[pos.line].length, line: pos.line};
        }
        return pos;
    }

    /**
     * Function that returns weather a filer is a text file or not
     * Used for differentiating the way in which the file is sent to the client
     * A binary file is sent peer to peer, whereas a text file is sent through a socket server.
     * @param {File} : file to be identified as text/binary.
     */
    function _isTextFile(file) {
        //needs to be checked for text/non-text files
        var ext = Path.extname(file);
        if(ext === ".jpg]" || ext === ".png]" || ext === ".pdf]" || ext === ".mp4]") {
            return false;
        }

        return true;
    }

    /**
     * Public function that is triggered when the user makes a change to his editor.
     * The function sends this change to all the connected peers for them to apply the same
     * to their editors.
     * @param {Array} Array containing set of changes made by the user
     * fullPath {String} Identifier of the file to which the change was made.
     */
    function triggerCodemirrorChange(changeList, fullPath) {
        if(_changing) {
            return;
        }
        var relPath = Path.relative(StartupState.project("root"), fullPath);
        _webrtc.sendToAll("codemirror-change", {changes: changeList, path: relPath});
    };

    /**
     * Private function to send a file to the connected peers.
     * This could be a newly added file at this client's brackets istance, or could be a file
     * that a peer has asked for initializing his/her filesystem.
     * @param {!File} : addedFile : File that is to be sent
     * @param {!peer} : Peer to which the image needs to be sent. Default as all the peers
     * @param {!String} : Type of message to identify the event on remote clients. Default as 'file-addeed'.
     */
    function _sendFileViaWebRTC(addedFile, peer, message) {
        message = message || 'file-added';
        var relPath = Path.relative(StartupState.project("root"), addedFile._path);
        // send file only if this client added this file, and not received it
        if(_received[relPath]) {
            // Clear _received of file name for future events.
            delete _received[relPath];
            return;
        }

        if(addedFile.isDirectory) {
            if(peer) {
                peer.send(message, {path: relPath, isFolder: true});
                return;
            }
            _webrtc.sendToAll(message, {path: relPath, isFolder: true});
            return;
        }

        if(_isTextFile(addedFile)) {
            FilerUtils.readFileAsUTF8(addedFile._path)
            .done(function(text, stats) {
                if(peer) {
                    peer.send(message, {path: relPath, text: text, isFolder: false});
                    return;
                }
                _webrtc.sendToAll(message, {path: relPath, text: text, isFolder: false});
            })
            .fail(function(err) {
                console.log("Not Able to Read File while Collaborating");
            });
            return;
        }

        FilerUtils.readFileAsBinary(addedFile._path, function(err, buffer) {
            if(err) {
                console.log(err);
            }
            var file = new File([buffer], relPath);
            if(peer) {
                peer.sendFile(file);
                return;
            }
            _webrtc.getPeers().forEach(function(peer) {
                peer.sendFile(file);
            });
        });
    }

    exports.applyDiffsToFile = applyDiffsToFile;
    exports.connect = connect;
    exports.triggerCodemirrorChange = triggerCodemirrorChange;
});
