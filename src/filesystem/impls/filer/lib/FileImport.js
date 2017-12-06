
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define*/

define(function (require, exports, module) {
    "use strict";

    var LegacyFileImport    = require("filesystem/impls/filer/lib/LegacyFileImport"),
        WebKitFileImport    = require("filesystem/impls/filer/lib/WebKitFileImport"),
        FileSystemCache     = require("filesystem/impls/filer/FileSystemCache"),
        BrambleStartupState = require("bramble/StartupState"),
        LiveDevMultiBrowser = require("LiveDevelopment/LiveDevMultiBrowser"),
        PreferencesManager  = require("preferences/PreferencesManager");

    /**
     * XXXBramble: the Drag and Drop and File APIs are a mess of incompatible
     * standards and implementations.  This tries to deal with the fact that some
     * browsers allow you to drag-and-drop folders, and some don't.  All
     * browsers we support will do file drag-and-drop, so we want to make sure
     * we always allow that.
     *
     * Currently, dragging folders works in Chrome (13), Edge, Firefox (50)
     * but not in IE, Opera, or Safari.
     *
     * See:
     *  - https://html.spec.whatwg.org/#the-datatransferitem-interface
     *  - https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
     *  - https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
     *  - https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
     *  - https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
     */
    function chooseImportStrategy(source) {
        if(source instanceof FileList) {
            return LegacyFileImport.create();
        }

        if(source instanceof DataTransfer) {
            if(window.DataTransferItem                            &&
               window.DataTransferItem.prototype.webkitGetAsEntry &&
               window.DataTransferItemList) {
                return WebKitFileImport.create();
            }
            return LegacyFileImport.create();
        }
    }

    // Support passing a DataTransfer object, or a FileList
    exports.import = function(source, parentPath, callback) {
        if(!(source instanceof FileList || source instanceof DataTransfer)) {
            callback(new Error("[Bramble] expected DataTransfer or FileList to FileImport.import()"));
            return;
        }

        var strategy = chooseImportStrategy(source);

        // pause live preview updates until all files have been imported
        PreferencesManager.set("livePreviewAutoReload", false);

        // If we are given a sub-dir within the project, use that.  Otherwise use project root.
        parentPath = parentPath || BrambleStartupState.project("root");

        return strategy.import(source, parentPath, function(err) {
            // enable live preview updates after all files have been imported
            PreferencesManager.set("livePreviewAutoReload", true);

            if(err) {
                return callback(err);
            }
            FileSystemCache.refresh(function() {
                LiveDevMultiBrowser.reload();
                callback();
            });
        });
    };
});
