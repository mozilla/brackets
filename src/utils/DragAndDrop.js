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

    var Async           = require("utils/Async"),
        CommandManager  = require("command/CommandManager"),
        Commands        = require("command/Commands"),
        Dialogs         = require("widgets/Dialogs"),
        DefaultDialogs  = require("widgets/DefaultDialogs"),
        MainViewManager = require("view/MainViewManager"),
        FileSystem      = require("filesystem/FileSystem"),
        FileUtils       = require("file/FileUtils"),
        ProjectManager  = require("project/ProjectManager"),
        Strings         = require("strings"),
        StringUtils     = require("utils/StringUtils"),
        // XXXBramble specific bits
        FileImport      = require("filesystem/impls/filer/lib/FileImport"),
        FileSystemCache = require("filesystem/impls/filer/FileSystemCache"),
        Sizes           = require("filesystem/impls/filer/lib/Sizes");

    // If the user indicates they want to import files deep into the filetree
    // this is the path they want to use as a parent dir root.
    var _dropPathHint;

    /**
     * Returns true if the drag and drop items contains valid drop objects.
     * @param {Array.<DataTransferItem>} items Array of items being dragged
     * @return {boolean} True if one or more items can be dropped.
     */
    function isValidDrop(types) {
        var i = 0;
        var type;

        if (types) {
            for (var i = 0; i < types.length; i++) {
                // Safari uses 'public.file-url', Mozilla recommends 'application/x-moz-file',
                // everyone else seems to use 'Files', accept any.
                type = types[i];
                if (type === "Files"               ||
                    type === "public.file-url"     ||
                    type === "application/x-moz-file") {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Determines if the event contains a type list that has a URI-list.
     * If it does and contains an empty file list, then what is being dropped is a URL.
     * If that is true then we stop the event propagation and default behavior to save Brackets editor from the browser taking over.
     * @param {Array.<File>} files Array of File objects from the event datastructure. URLs are the only drop item that would contain a URI-list.
     * @param {event} event The event datastucture containing datatransfer information about the drag/drop event. Contains a type list which may or may not hold a URI-list depending on what was dragged/dropped. Interested if it does.
     */
    function stopURIListPropagation(event) {
        var files = event.dataTransfer.files;
        var types = event.dataTransfer.types;

        if ( !(files && files.length) && types ) { // We only want to check if a string of text was dragged into the editor
            types.forEach(function (value) {
                //Draging text externally (dragging text from another file): types has "text/plain" and "text/html"
                //Draging text internally (dragging text to another line): types has just "text/plain"
                //Draging a file: types has "Files"
                //Draging a url: types has "text/plain" and "text/uri-list" <-what we are interested in
                if (value === "text/uri-list") {
                    event.stopPropagation();
                    event.preventDefault();
                    return;
                }
            });
        }
    }

    function _showErrorDialog(errorFiles, callback) {
        function errorToString(err) {
            return FileUtils.getFileErrorString(err);
        }

        if (!errorFiles.length) {
            return;
        }

        var message = Strings.ERROR_OPENING_FILES;

        message += "<ul class='dialog-list'>";
        errorFiles.forEach(function (info) {
            message += "<li><span class='dialog-filename'>" +
                StringUtils.breakableUrl(ProjectManager.makeProjectRelativeIfPossible(info.path)) +
                "</span> - " + errorToString(info.error) +
                "</li>";
        });
        message += "</ul>";

        var dlg = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            Strings.ERROR_OPENING_FILE_TITLE,
            message
        );

        if(callback) {
            dlg.done(callback);
        }
    }

    /**
     * Open dropped files
     * @param {Array.<string>} files Array of files dropped on the application.
     * @return {Promise} Promise that is resolved if all files are opened, or rejected
     *     if there was an error.
     */
    function openDroppedFiles(paths) {
        var errorFiles = [],
            ERR_MULTIPLE_ITEMS_WITH_DIR = {};

        return Async.doInParallel(paths, function (path, idx) {
            var result = new $.Deferred();

            // Only open files.
            FileSystem.resolve(path, function (err, item) {
                if (!err && item.isFile) {
                    // If the file is already open, and this isn't the last
                    // file in the list, return. If this *is* the last file,
                    // always open it so it gets selected.
                    if (idx < paths.length - 1) {
                        if (MainViewManager.findInWorkingSet(MainViewManager.ALL_PANES, path) !== -1) {
                            result.resolve();
                            return;
                        }
                    }

                    CommandManager.execute(Commands.CMD_ADD_TO_WORKINGSET_AND_OPEN,
                                           {fullPath: path, silent: true})
                        .done(function () {
                            result.resolve();
                        })
                        .fail(function (openErr) {
                            errorFiles.push({path: path, error: openErr});
                            result.reject();
                        });
                } else if (!err && item.isDirectory && paths.length === 1) {
                    // One folder was dropped, open it.
                    ProjectManager.openProject(path)
                        .done(function () {
                            result.resolve();
                        })
                        .fail(function () {
                            // User was already notified of the error.
                            result.reject();
                        });
                } else {
                    errorFiles.push({path: path, error: err || ERR_MULTIPLE_ITEMS_WITH_DIR});
                    result.reject();
                }
            });

            return result.promise();
        }, false)
            .fail(function () {
                function errorToString(err) {
                    if (err === ERR_MULTIPLE_ITEMS_WITH_DIR) {
                        return Strings.ERROR_MIXED_DRAGDROP;
                    } else {
                        return FileUtils.getFileErrorString(err);
                    }
                }

                if (errorFiles.length > 0) {
                    var message = Strings.ERROR_OPENING_FILES;

                    message += "<ul class='dialog-list'>";
                    errorFiles.forEach(function (info) {
                        message += "<li><span class='dialog-filename'>" +
                            StringUtils.breakableUrl(ProjectManager.makeProjectRelativeIfPossible(info.path)) +
                            "</span> - " + errorToString(info.error) +
                            "</li>";
                    });
                    message += "</ul>";

                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_ERROR,
                        Strings.ERROR_OPENING_FILE_TITLE,
                        message
                    );
                }
            });
    }

    /**
     * Attaches global drag & drop handlers to this window. This enables dropping files/folders to open them, and also
     * protects the Brackets app from being replaced by the browser trying to load the dropped file in its place.
     */
    function attachHandlers(options) {
        // XXXBramble: we want to reuse this code for the UploadFiles extension
        // so we add support for passing exra options here.
        options = options || {};
        options.elem = options.elem || window.document.body;
        // Support optional events hooks
        var noop = function(){};
        options.ondragover = options.ondragover || noop;
        options.ondragleave = options.ondragleave || noop;
        options.ondrop = options.ondrop || noop;
        options.onfilesdone = options.onfilesdone || noop;

        // XXXBramble: extra dragleave event for UI updates in UploadFiles
        function handleDragLeave(event) {
            event = event.originalEvent || event;
            event.stopPropagation();
            event.preventDefault();

            options.ondragleave(event);
        }

        function handleDragOver(event) {
            event = event.originalEvent || event;
            stopURIListPropagation(event);

            event.stopPropagation();
            event.preventDefault();
            options.ondragover(event);

            var dropEffect =  "none";
            // XXXBramble: we want to reuse this in the UploadFiles modal, so treat body differently
            if(isValidDrop(event.dataTransfer.types)) {
                if(options.elem === window.document.body) {
                    if($(".modal.instance").length === 0) {
                        dropEffect = "copy";
                    }
                } else {
                    dropEffect = "copy";
                }
            }
            event.dataTransfer.dropEffect = dropEffect;
        }

        function handleDrop(event) {
            event = event.originalEvent || event;
            stopURIListPropagation(event);

            event.stopPropagation();
            event.preventDefault();
            options.ondrop(event);

            processFiles(event.dataTransfer, function(err) {
                if(err) {
                    console.log("[Bramble] error handling dropped files", err);
                }

                options.onfilesdone();

                if(options.autoRemoveHandlers) {
                    var elem = options.elem;
                    $(elem)
                        .off("dragover", handleDragOver)
                        .off("dragleave", handleDragLeave)
                        .off("drop", handleDrop);

                    elem.removeEventListener("dragover", codeMirrorDragOverHandler, true);
                    elem.removeEventListener("dragleave", codeMirrorDragLeaveHandler, true);
                    elem.removeEventListener("drop", codeMirrorDropHandler, true);
                }
            });
        }

        // For most of the window, only respond if nothing more specific in the UI has already grabbed the event (e.g.
        // the Extension Manager drop-to-install zone, or an extension with a drop-to-upload zone in its panel)
        $(options.elem)
            .on("dragover", handleDragOver)
            .on("dragleave", handleDragLeave)
            .on("drop", handleDrop);

        // Over CodeMirror specifically, always pre-empt CodeMirror's drag event handling if files are being dragged - CM stops
        // propagation on any drag event it sees, even when it's not a text drag/drop. But allow CM to handle all non-file drag
        // events. See bug #10617.
        var codeMirrorDragOverHandler = function (event) {
            if ($(event.target).closest(".CodeMirror").length) {
                handleDragOver(event);
            }
        };
        var codeMirrorDropHandler = function (event) {
            if ($(event.target).closest(".CodeMirror").length) {
                handleDrop(event);
            }
        };
        var codeMirrorDragLeaveHandler = function (event) {
            if ($(event.target).closest(".CodeMirror").length) {
                handleDragLeave(event);
            }
        };
        options.elem.addEventListener("dragover", codeMirrorDragOverHandler, true);
        options.elem.addEventListener("dragleave", codeMirrorDragLeaveHandler, true);
        options.elem.addEventListener("drop", codeMirrorDropHandler, true);
    }

    /**
     * Given a `source` of files (DataTransfer or FileList objects), get the associated files
     * and process them, such that they end
     */
    function processFiles(source, callback) {
        // Make sure we have enough room to add new files.
        if(Sizes.getEnforceLimits()) {
            return CommandManager
                .execute("bramble.projectSizeError")
                .done(function() {
                    callback(new Error("not enough free space."));
                });
        }

        FileImport.import(source, _dropPathHint, function(err, paths) {
            // Reset drop path, until we get an explicit one set in future.
            _dropPathHint = null;

            if(err) {
                _showErrorDialog(err);
                callback(err);
                return;
            }

            // Don't crash in legacy browsers if we rejected all paths (e.g., folder(s)).
            paths = paths || [];
            openDroppedFiles(paths);

            callback();
        });
    }

    /**
     * Sets a path to a root dir to use for importing dropped paths (see FileTreeView.js)
     */
    function setDropPathHint(path) {
        _dropPathHint = path;
    }

    CommandManager.register(Strings.CMD_OPEN_DROPPED_FILES, Commands.FILE_OPEN_DROPPED_FILES, openDroppedFiles);

    // Export public API
    exports.processFiles        = processFiles;
    exports.attachHandlers      = attachHandlers;
    exports.isValidDrop         = isValidDrop;
    exports.openDroppedFiles    = openDroppedFiles;
    exports.setDropPathHint     = setDropPathHint;
});
