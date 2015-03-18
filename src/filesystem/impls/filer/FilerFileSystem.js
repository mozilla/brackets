/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, appshell */

define(function (require, exports, module) {
    "use strict";

    var FileSystemError = require("filesystem/FileSystemError"),
        FileSystemStats = require("filesystem/FileSystemStats"),
        Filer           = require("thirdparty/filer/dist/filer"),
        Dialog          = require("thirdparty/filer-dialogs/filer-dialogs");

    var fs,
        Path            = Filer.Path,
        watchers        = {};

    var _changeCallback;            //Callback to notify FileSystem of watcher changes

    Filer.fs = function() {
        if(fs) {
            return fs;
        }

        return new Filer.FileSystem({provider: new Filer.FileSystem.providers.Memory()});
    };

    Filer.blobs = {};

    fs = Filer.fs();

    appshell.Filer = Filer;

    function showOpenDialog(allowMultipleSelection, chooseDirectories, title, initialPath, fileTypes, callback) {
        Dialog.showOpenDialog.apply(null, arguments);
    }

    function showSaveDialog(title, initialPath, defaultName, callback) {
        Dialog.showSaveAsDialog.apply(null, arguments);
    }

    function mimeFromExt(ext) {
        switch(ext) {
            case ".html":
            case ".htmls":
            case ".htm":
            case ".htx":
                return "text/html";
            case ".ico":
                return "image/x-icon";
            case ".bmp":
                return "image/bmp";
            case ".css":
                return "text/css";
            case ".js":
                return "text/javascript";
            case ".svg":
                return "image/svg+xml";
            case ".png":
                return "image/png";
            case ".ico":
                return "image/x-icon";
            case ".jpg":
            case ".jpe":
            case ".jpeg":
                return "image/jpeg";
            case ".gif":
                return "image/gif";
            // Some of these media types can be video or audio, prefer video.
            case ".mp4":
                return "video/mp4";
            case ".mpeg":
                return "video/mpeg";
            case ".ogg":
            case ".ogv":
                return "video/ogg";
            case ".mov":
            case ".qt":
                return "video/quicktime";
            case ".webm":
                return "video/webm";
            case ".avi":
            case ".divx":
                return "video/avi";
            case ".mpa":
            case ".mp3":
                return "audio/mpeg";
            case ".wav":
                return "audio/vnd.wave";
        }

        return "application/octet-stream";
    }

    function generateBlobURL(filename, data) {
        var type = mimeFromExt(Path.extname(filename));
        var blob = new Blob([data], {type: type});
        
        Filer.blobs[filename] = URL.createObjectURL(blob);
    }

    /**
     * Convert Filer error codes to FileSystemError values.
     *
     * @param {?number} err A Filer error code
     * @return {?string} A FileSystemError string, or null if there was no error code.
     * @private
     **/
    function _mapError(err) {
        if (!err) {
            return null;
        }

        switch (err.code) {
        case "EINVAL":
            return FileSystemError.INVALID_PARAMS;
        case "ENOENT":
            return FileSystemError.NOT_FOUND;
        case "EROFS":
            return FileSystemError.NOT_WRITABLE;
        case "ENOSPC":
            return FileSystemError.OUT_OF_SPACE;
        case "ENOTEMPTY":
        case "EEXIST":
            return FileSystemError.ALREADY_EXISTS;
        case "ENOTDIR":
            return FileSystemError.INVALID_PARAMS;
        case "EBADF":
            return FileSystemError.NOT_READABLE;
        }

        return FileSystemError.UNKNOWN;
    }

    /**
     * Convert a callback to one that transforms its first parameter from a
     * Filer error code to a FileSystemError string.
     *
     * @param {function(?number)} cb A callback that expects an Filer error code
     * @return {function(?string)} A callback that expects a FileSystemError string
     * @private
     **/
    function _wrap(cb) {
        return function (err) {
            var args = Array.prototype.slice.call(arguments);
            args[0] = _mapError(args[0]);
            cb.apply(null, args);
        };
    }

    function stat(path, callback) {
        fs.stat(path, function(err, stats) {
            if (err){
                callback(_mapError(err));
                return;
            }

            var mtime = new Date(stats.mtime);

            var options = {
                isFile: stats.isFile(),
                mtime: mtime,
                size: stats.size,
                // TODO: figure out how to deal with realPath
                realPath: path,
                hash: mtime.getTime()
            };

            var fsStats = new FileSystemStats(options);

            callback(null, fsStats);
        });
    }


    function exists(path, callback) {
        fs.exists(path, function(exists) {
            callback(null, exists);
        });
    }

    function readdir(path, callback) {
        path = Path.normalize(path);

        fs.readdir(path, function (err, contents) {
            if (err) {
                callback(_mapError(err));
                return;
            }

            var count = contents.length;
            if (!count) {
                callback(null, [], []);
                return;
            }

            var stats = [];
            contents.forEach(function (val, idx) {
                stat(Path.join(path, val), function (err, stat) {
                    stats[idx] = err || stat;
                    count--;
                    if (count <= 0) {
                        callback(null, contents, stats);
                    }
                });
            });
        });
    }

    function mkdir(path, mode, callback) {
        if(typeof mode === "function") {
            callback = mode;
        }

        fs.mkdir(path, mode, function (err) {
            if (err) {
                callback(_mapError(err));
                return;
            }
            stat(path, callback);
        });
    }

    function rename(oldPath, newPath, callback) {
        function updateBlobURL(err) {
            if(err) {
                return callback(err);
            }
            Filer.blobs[Path.normalize(newPath)] = Filer.blobs[Path.normalize(oldPath)];
            delete Filer.blobs[Path.normalize(oldPath)];
        }
        fs.rename(oldPath, newPath, _wrap(updateBlobURL));
    }

    function readFile(path, options, callback) {
        if(typeof options === "function") {
            callback = options;
        }
        options = options || {};

        var encoding = options.encoding || "utf8";

        // Execute the read and stat calls in parallel. Callback early if the
        // read call completes first with an error; otherwise wait for both
        // to finish.
        var done = false, data, stat, err;

        if (options.stat) {
            done = true;
            stat = options.stat;
        } else {
            exports.stat(path, function (_err, _stat) {
                if (done) {
                    callback(_err, _err ? null : data, _stat);
                } else {
                    done = true;
                    stat = _stat;
                    err = _err;
                }
            });
        }

        fs.readFile(path, encoding, function (_err, _data) {
            if (_err) {
                callback(_mapError(_err));
                return;
            }

            if (done) {
                callback(err, err ? null : _data, stat);
            } else {
                done = true;
                data = _data;
            }
        });
    }

    function writeFile(path, data, options, callback) {
        if(typeof options === "function") {
            callback = options;
        }
        options = options || {};

        var encoding = options.encoding || "utf8";

        function _finishWrite(created) {
            fs.writeFile(path, data, encoding, function (err) {
                if (err) {
                    callback(_mapError(err));
                    return;
                }

                //We need to generate a blob to that it'll be available
                //synchronously later when the live preview server needs it
                generateBlobURL(Path.normalize(path), data);

                stat(path, function (err, stat) {
                    callback(err, stat, created);
                });
            });
        }

        stat(path, function (err, stats) {
            if (err) {
                switch (err) {
                case FileSystemError.NOT_FOUND:
                    _finishWrite(true);
                    break;
                default:
                    callback(err);
                }
                return;
            }

            if (options.hasOwnProperty("expectedHash") && options.expectedHash !== stats._hash) {
                console.error("Blind write attempted: ", path, stats._hash, options.expectedHash);

                if (options.hasOwnProperty("expectedContents")) {
                    fs.readFile(path, encoding, function (_err, _data) {
                        if (_err || _data !== options.expectedContents) {
                            callback(FileSystemError.CONTENTS_MODIFIED);
                            return;
                        }

                        _finishWrite(false);
                    });
                    return;
                } else {
                    callback(FileSystemError.CONTENTS_MODIFIED);
                    return;
                }
            }

            _finishWrite(false);
        });
    }

    function unlink(path, callback) {
        fs.unlink(path, function(err){
            //Clear the blob cache for this path
            //TODO: figure out symlink case and
            //whether we want to clear the cache
            delete Filer.blobs[Path.normalize(path)];
            callback(_mapError(err));
        });
    }

    function moveToTrash(path, callback) {
        // TODO: do we want to support a .trash/ dir or the like?
        unlink(path, callback);
    }

    function initWatchers(changeCallback, offlineCallback) {
        _changeCallback = changeCallback;
    }

    function watchPath(path, callback) {
        path = Path.normalize(path);

        if(watchers[path]) {
            return;
        }
        watchers[path] = fs.watch(path, {recursive: true}, function(event, filename) {
            stat(filename, function(err, stats) {
                if(err) {
                    return;
                }
                _changeCallback(filename, stats);
            });
        });
        callback();
    }

    function unwatchPath(path, callback) {
        path = Path.normalize(path);

        if(watchers[path]) {
            watchers[path].close();
            delete watchers[path];
        }
        callback();
    }

    function unwatchAll(callback) {
        Object.keys(watchers).forEach(function(path) {
            unwatchPath(path, function(){});
        });
        callback();
    }

    // Export public API
    exports.showOpenDialog  = showOpenDialog;
    exports.showSaveDialog  = showSaveDialog;
    exports.exists          = exists;
    exports.readdir         = readdir;
    exports.mkdir           = mkdir;
    exports.rename          = rename;
    exports.stat            = stat;
    exports.readFile        = readFile;
    exports.writeFile       = writeFile;
    exports.unlink          = unlink;
    exports.moveToTrash     = moveToTrash;
    exports.initWatchers    = initWatchers;
    exports.watchPath       = watchPath;
    exports.unwatchPath     = unwatchPath;
    exports.unwatchAll      = unwatchAll;

    exports.recursiveWatch    = true;
    exports.normalizeUNCPaths = false;
});
