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
        Strings         = require("strings"),
        FilerUtils      = require("filesystem/impls/filer/FilerUtils"),
        Buffer          = FilerUtils.Buffer,
        Path            = FilerUtils.Path,
        Content         = require("filesystem/impls/filer/lib/content"),
        ArchiveUtils    = require("filesystem/impls/filer/ArchiveUtils");

    function LegacyFileImport(){}

    // We want event.dataTransfer.files for legacy browsers.
    LegacyFileImport.prototype.import = function(source, parentPath, callback) {
        var files = source instanceof DataTransfer ? source.files : source;
        var pathsToOpen = [];
        var errorList = [];

        if (!(files && files.length)) {
            return callback(null, []);
        }

        function handleRegularFile(deferred, filename, buffer) {
            // Don't write thing like .DS_Store, thumbs.db, etc.
            if(ArchiveUtils.skipFile(filename)) {
                deferred.resolve();
                return;
            }

            FilerUtils
                .writeFileAsBinary(filename, buffer)
                .done(function() {
                    pathsToOpen.push(filename);
                    deferred.resolve();
                })
                .fail(function(err) {
                    errorList.push({path: filename, error: err.message || "unable to write file" });
                    deferred.reject(err);
                });
        }

        function handleZipFile(deferred, file, filename, buffer, encoding) {
            var basename = Path.basename(filename);

            ArchiveUtils.unzip(buffer, { root: parentPath }, function(err, unzippedPaths) {
                if (err) {
                    errorList.push({path: filename, error: Strings.DND_ERROR_UNZIP});
                    deferred.reject(err);
                    return;
                }

                pathsToOpen = pathsToOpen.concat(unzippedPaths);
                deferred.resolve();
            });
        }

        function handleTarFile(deferred, file, filename, buffer, encoding) {
            var basename = Path.basename(filename);

            ArchiveUtils.untar(buffer, { root: parentPath }, function(err, untarredPaths) {
                if (err) {
                    errorList.push({path: filename, error: Strings.DND_ERROR_UNTAR});
                    deferred.reject(err);
                    return;
                }

                pathsToOpen = pathsToOpen.concat(untarredPaths);
                deferred.resolve();
            });
        }

        function prepareDropPaths(fileList) {
            // Convert FileList object to an Array with all image files first, then CSS
            // followed by HTML files at the end, since we need to write any .css, .js, etc.
            // resources first such that Blob URLs can be generated for these resources
            // prior to rewriting an HTML file.
            function rateFileByType(filename) {
                var ext = Path.extname(filename);

                // We want to end up with: [images, ..., js, ..., css, html]
                // since CSS can include images, and HTML can include CSS or JS.
                // We also treat .md like an HTML file, since we render them.
                if(Content.isHTML(ext) || Content.isMarkdown(ext)) {
                    return 10;
                } else if(Content.isCSS(ext)) {
                    return 8;
                } else if(Content.isImage(ext)) {
                    return 1;
                }
                return 3;
            }

            return _.toArray(fileList).sort(function(a,b) {
                a = rateFileByType(a.name);
                b = rateFileByType(b.name);

                if(a < b) {
                    return -1;
                }
                if(a > b) {
                    return 1;
                }
                return 0;
            });
        }

        function maybeImportFile(item) {
            var deferred = new $.Deferred();
            var reader = new FileReader();

            // Check whether we want to import this file at all before we start.
            var wasRejected = Content.shouldRejectFile(item.name, item.size);
            if (wasRejected) {
                errorList.push({path: item.name, error: wasRejected.message});
                deferred.reject(wasRejected);
                return deferred.promise();
            }

            reader.onload = function(e) {
                delete reader.onload;

                var filename = Path.join(parentPath, item.name);
                var ext = FilerUtils.normalizeExtension(Path.extname(filename));
                var buffer = new Buffer(e.target.result);

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

                errorList.push({path: item.name, error: e.target.error.message});
                deferred.reject(e.target.error);
            };
            reader.readAsArrayBuffer(item);

            return deferred.promise();
        }

        Async.doSequentially(prepareDropPaths(files), maybeImportFile, false)
            .done(function() {
                callback(null, pathsToOpen);
            })
            .fail(function() {
                callback(errorList);
            });
    };

    exports.create = function(options) {
        return new LegacyFileImport(options);
    };
});
