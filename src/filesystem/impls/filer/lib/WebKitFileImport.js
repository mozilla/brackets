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
        FileSystem      = require("filesystem/FileSystem"),
        FileUtils       = require("file/FileUtils"),
        FilerUtils      = require("filesystem/impls/filer/FilerUtils"),
        Path            = FilerUtils.Path,
        Buffer          = FilerUtils.Buffer,
        Strings         = require("strings"),
        Content         = require("filesystem/impls/filer/lib/content"),
        ArchiveUtils    = require("filesystem/impls/filer/ArchiveUtils");

    function WebKitFileImport(){}

    // We want event.dataTransfer.items for WebKit style browsers
    WebKitFileImport.prototype.import = function(source, parentPath, callback) {
        var items = source instanceof DataTransfer ? source.items : source;
        var pathsToOpen = [];
        var errorList = [];
        var started = 0;
        var completed = 0;

        if (!(items && items.length)) {
            return callback(null, []);
        }

        function checkDone() {
            if(started === completed) {
                if(errorList.length) {
                    callback(errorList);
                } else {
                    callback(null, pathsToOpen);
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

        function handleRegularFile(deferred, filename, buffer) {
            FilerUtils
                .writeFileAsBinary(filename, buffer)
                .done(function() {
                    pathsToOpen.push(filename);
                    onSuccess(deferred);
                })
                .fail(function(err) {
                    onError(deferred, filename, err);
                });
        }

        function handleZipFile(deferred, filename, buffer) {
            var basename = Path.basename(filename);

            ArchiveUtils.unzip(buffer, { root: parentPath }, function(err, unzippedPaths) {
                if (err) {
                    onError(deferred, filename, new Error(Strings.DND_ERROR_UNZIP));
                    return;
                }

                pathsToOpen = pathsToOpen.concat(unzippedPaths);
                onSuccess(deferred);
            });
        }

        function handleTarFile(deferred, filename, buffer) {
            var basename = Path.basename(filename);

            ArchiveUtils.untar(buffer, { root: parentPath }, function(err, untarredPaths) {
                if (err) {
                    onError(deferred, filename, new Error(Strings.DND_ERROR_UNTAR));
                    return;
                }

                pathsToOpen = pathsToOpen.concat(untarredPaths);
                onSuccess(deferred);
            });
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
                    var ext = FilerUtils.normalizeExtension(Path.extname(filename));
                    var buffer = new Buffer(e.target.result);

                    // Don't bother writing things like .DS_Store, thumbs.db, etc.
                    if(ArchiveUtils.skipFile(filename)) {
                        onSuccess(deferred);
                        return;
                    }

                    // Check whether we want to import this file at all before we start.
                    var wasRejected = Content.shouldRejectFile(entry.name, buffer.byteLength);
                    if (wasRejected) {
                        onError(deferred, entry.name, wasRejected);
                        return;
                    }

                    // Special-case .zip files, so we can offer to extract the contents
                    if(ext === ".zip") {
                        handleZipFile(deferred, filename, buffer);
                    } else if(ext === ".tar") {
                        handleTarFile(deferred, filename, buffer);
                    } else {
                        handleRegularFile(deferred, filename, buffer);
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
