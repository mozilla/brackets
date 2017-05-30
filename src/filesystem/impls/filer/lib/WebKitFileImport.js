 /*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, FileReader*/

define(function (require, exports, module) {
    "use strict";

    var _               = require("thirdparty/lodash"),
        Async           = require("utils/Async"),
        Dialogs         = require("widgets/Dialogs"),
        DefaultDialogs  = require("widgets/DefaultDialogs"),
        FileSystem      = require("filesystem/FileSystem"),
        FileUtils       = require("file/FileUtils"),
        Strings         = require("strings"),
        StringUtils     = require("utils/StringUtils"),
        Filer           = require("filesystem/impls/filer/BracketsFiler"),
        Path            = Filer.Path,
        Content         = require("filesystem/impls/filer/lib/content"),
        LanguageManager = require("language/LanguageManager"),
        StartupState    = require("bramble/StartupState"),
        ArchiveUtils    = require("filesystem/impls/filer/ArchiveUtils"),
        FilerUtils      = require("filesystem/impls/filer/FilerUtils");

    function WebKitFileImport(options) {
        this.byteLimit = options.byteLimit;
        this.archiveByteLimit = options.archiveByteLimit;
    }

    // We want event.dataTransfer.items for WebKit style browsers
    WebKitFileImport.prototype.import = function(source, parentPath, callback) {
        var items = source instanceof DataTransfer ? source.items : source;
        var byteLimit = this.byteLimit;
        var archiveByteLimit = this.archiveByteLimit;
        var pathList = [];
        var errorList = [];
        var started = 0;
        var completed = 0;

        if (!(items && items.length)) {
            return callback();
        }

        function shouldOpenFile(filename, encoding) {
            return Content.isImage(Path.extname(filename)) || encoding === "utf8";
        }

        function checkDone() {
            if(started === completed) {
                if(errorList.length) {
                    callback(errorList);
                } else {
                    callback(null, pathList);
                }
            }
        }

        function onError(deferred, path, err) {
            completed++;
            errorList.push({path: path, error: err.message});
            deferred.reject(err);
            checkDone();
        }

        function onSuccess(deferred) {
            completed++;
            deferred.resolve();
            checkDone();
        }

        function handleDirectory(deferred, entry, path) {
            function readDir(folder, callback) {
                var reading = 0;

                function read(reader) {
                    reading++;

                    reader.readEntries(function(entries) {
                        reading--;

                        entries.forEach(function(entry) {
                            if(entry.isDirectory) {
                                maybeImportDirectory(path, entry);
                            } else {
                                maybeImportFile(path, entry);
                            }
                        });

                        if(entries.length) {
                            read(reader);
                        } else if(reading === 0) {
                            callback();
                        }
                    });
                }

                read(folder.createReader());
            }

            FileSystem.getDirectoryForPath(path).create(function(err) {
                if(err && err.code !== "EEXIST") {
                    onError(deferred, path, err);
                    return;
                }

                // Manually increase completed count by 1 for dir itself
                completed++;

                readDir(entry, function(files) {
                    deferred.resolve();
                });
            });
        }

        function handleRegularFile(deferred, file, filename, buffer, encoding) {
            file.write(buffer, {encoding: encoding}, function(err) {
                if (err) {
                    onError(deferred, filename, err);
                    return;
                }

                // See if this file is worth trying to open in the editor or not
                if(shouldOpenFile(filename, encoding)) {
                    pathList.push(filename);
                }

                onSuccess(deferred);
            });
        }

        function handleZipFile(deferred, file, filename, buffer, encoding) {
            var basename = Path.basename(filename);

            ArchiveUtils.unzip(buffer, { root: parentPath }, function(err) {
                if (err) {
                    onError(deferred, filename, new Error(Strings.DND_ERROR_UNZIP));
                    return;
                }

                onSuccess(deferred);
            });
        }

        function handleTarFile(deferred, file, filename, buffer, encoding) {
            var basename = Path.basename(filename);

            ArchiveUtils.untar(buffer, { root: parentPath }, function(err) {
                if (err) {
                    onError(deferred, filename, new Error(Strings.DND_ERROR_UNTAR));
                    return;
                }

                onSuccess(deferred);
            });
        }

        /**
         * Determine whether we want to import this file at all.  If` it's too large
         * or not a mime type we care about, reject it.
         */
        function rejectImport(filename, size) {
            var ext = Path.extname(filename);
            var mime = Content.mimeFromExt(ext);
            var isArchive = Content.isArchive(ext);
            var sizeLimit =  isArchive ? archiveByteLimit : byteLimit;
            var sizeLimitMb = (sizeLimit / (1024 * 1024)).toString();

            if (size > sizeLimit) {
                return new Error(StringUtils.format(Strings.DND_MAX_SIZE_EXCEEDED, sizeLimitMb));
            }

            // If we don't know about this language type, or the OS doesn't think
            // it's text, reject it.
            var isSupported = !!LanguageManager.getLanguageForExtension(FilerUtils.normalizeExtension(ext, true));
            var typeIsText = Content.isTextType(mime);

            if (isSupported || typeIsText || isArchive) {
                return null;
            }
            return new Error(Strings.DND_UNSUPPORTED_FILE_TYPE);
        }

        function maybeImportDirectory(parentPath, entry, deferred) {
            started++;
            var fullPath = Path.join(parentPath, entry.name);
            deferred = deferred || new $.Deferred();
            handleDirectory(deferred, entry, fullPath);
            return deferred.promise();
        }

        function maybeImportFile(parentPath, entry, deferred) {
            started++;
            deferred = deferred || new $.Deferred();

            entry.file(function(file) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    delete reader.onload;

                    var filename = Path.join(parentPath, entry.name);
                    var file = FileSystem.getFileForPath(filename);
                    var ext = Path.extname(filename).toLowerCase();

                    // Create a Filer Buffer, and determine the proper encoding.
                    var buffer = new Filer.Buffer(e.target.result);
                    var utf8FromExt = Content.isUTF8Encoded(ext);
                    var encoding = utf8FromExt ? "utf8" : null;
                    if(utf8FromExt) {
                        buffer = buffer.toString();
                    }

                    // Don't bother writing things like .DS_Store, thumbs.db, etc.
                    if(ArchiveUtils.skipFile(filename)) {
                        onSuccess(deferred);
                        return;
                    }

                    // Check whether we want to import this file at all before we start.
                    var wasRejected = rejectImport(entry.name, buffer.byteLength);
                    if (wasRejected) {
                        onError(deferred, entry.name, wasRejected);
                        return;
                    }

                    // Special-case .zip files, so we can offer to extract the contents
                    if(ext === ".zip") {
                        handleZipFile(deferred, file, filename, buffer, encoding);
                    } else if(ext === ".tar") {
                        handleTarFile(deferred, file, filename, buffer, encoding);
                    } else {
                        handleRegularFile(deferred, file, filename, buffer, encoding);
                    }
                };

                // Deal with error cases, for example, trying to drop a folder vs. file
                reader.onerror = function(e) {
                    delete reader.onerror;

                    onError(deferred, entry.name, e.target.error);
                };

                reader.readAsArrayBuffer(file);
            }, function(err) {
                onError(deferred, entry.name, err);
            });

            return deferred.promise();
        }

        function maybeImport(entry, count) {
            var deferred = new $.Deferred();
            var err;

            if(entry.isDirectory) {
                maybeImportDirectory(parentPath, entry, deferred);
            } else if (entry.isFile) {
                maybeImportFile(parentPath, entry, deferred);
            } else {
                // Skip it, we don't know what this is
                err = new Error(Strings.DND_UNSUPPORTED_FILE_TYPE);
                deferred.reject(err);
            }
        }

        // For security reasons, the DataTransferItemList is prone to going out of
        // scope, so we have to do this in a synchronous loop, otherwise I'd use async/promises.
        for(var i=0, l=items.length; i<l; i++) {
            maybeImport(items[i].webkitGetAsEntry());
        }
    };

    exports.create = function(options) {
        return new WebKitFileImport(options);
    };
});
