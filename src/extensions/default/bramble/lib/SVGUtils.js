/*global define: true */

define(function (require, exports, module) {
    "use strict";

    var Commands           = brackets.getModule("command/Commands");
    var CommandManager     = brackets.getModule("command/CommandManager");
    var MainViewManager    = brackets.getModule("view/MainViewManager");
    var DocumentManager    = brackets.getModule("document/DocumentManager");
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var Async              = brackets.getModule("utils/Async");
    var Path               = brackets.getModule("filesystem/impls/filer/BracketsFiler").Path;

    PreferencesManager.definePreference("openSVGasXML", "boolean", false);

    function doSave(doc) {
        var deferred = new $.Deferred();

        // No changes to save, skip.
        if(!doc.isDirty) {
            return deferred.resolve().promise();
        }

        CommandManager.get(Commands.FILE_SAVE)
            .execute({doc: doc})
            .then(deferred.resolve, deferred.reject);

        return deferred.promise();
    }

    function doClose(file) {
        return CommandManager.get(Commands.FILE_CLOSE)
            .execute({
                file: file,
                // Don't let it open the next file, we'll open this file again instead.
                _closeOptions: { noOpenNextFile: true }
            });
    }

    function doOpen(file) {
        return CommandManager.get(Commands.FILE_OPEN).execute({fullPath: file.fullPath});
    }

    // Close then Open a file so as to re-trigger the correct load logic (xml vs. image)
    function reload(file, deferred) {
        doClose(file)
            .done(function() {
                doOpen(file).then(deferred.resolve, deferred.reject);
            })
            .fail(deferred.reject);

        return deferred.promise();
    }

    function saveAndReload(file) {
        var deferred = new $.Deferred();

        // Depending on whether the svg file is loaded as XML, we may
        // or may not have a document.  If we don't, just close/reopen.
        var doc = DocumentManager.getOpenDocumentForPath(file.fullPath);
        if(!doc) {
            return reload(file, deferred);
        }

        // Potentially the doc will need to be saved before we close,
        // so save first, then close/reopen.
        doSave(doc)
            .done(function() {
                reload(file, deferred);
            })
            .fail(deferred.reject);

        return deferred.promise();
    }

    function refreshOpenFiles(callback) {
        // Get the list of all open SVG files, if any
        var openSVGFiles = MainViewManager.getAllOpenFiles().filter(function(file) {
            var path = file.fullPath;
            return Path.extname(path).toLowerCase() === ".svg";
        });

        // Loop through any open SVG files and close/reopen, saving first if necessary.
        Async.doSequentially(
            openSVGFiles,
            saveAndReload,
            false
        ).then(callback);
    };

    exports.showXML = function(callback) {
        PreferencesManager.set("openSVGasXML", true);
        refreshOpenFiles(callback);
    };

    exports.showImage = function(callback) {
        PreferencesManager.set("openSVGasXML", false);
        refreshOpenFiles(callback);
    };
});
