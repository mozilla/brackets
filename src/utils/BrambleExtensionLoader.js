/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

/**
 * BrambleExtensionLoader allows optional enabling/disabling of extensions
 * based on query string params.
 */

define(function (require, exports, module) {
    "use strict";

    var PathUtils = require("thirdparty/path-utils/path-utils");
    var Path      = require("filesystem/impls/filer/BracketsFiler").Path;
    var basePath  = PathUtils.directory(window.location.href);

    // Load the list of extensions. If you want to add/remove extensions, do it in this json file.
    var extensionInfo = JSON.parse(require("text!extensions/bramble-extensions.json"));

    // Disable any extensions we found on the query string's ?disableExtensions= param
    function _processDefaults(disableExtensions) {
        disableExtensions = disableExtensions ? disableExtensions.trim().split(/\s*,\s*/) : [];

        var brambleExtensions = [];
        extensionInfo.forEach(function(info) {
            var extPath = info.path;
            var extBasename = Path.basename(extPath);

            // Skip this extension if we've been instructed to disable via URL.
            // Support both 'extensions/default/Autosave' and 'Autosave' forms.
            if(disableExtensions.indexOf(extBasename) > -1 ||
               disableExtensions.indexOf(extPath) > -1           ) {
                console.log("[Bramble] Skipping loading of extension " + extBasename + " at " + extPath);
                return;
            }

            brambleExtensions.push({
                name: extPath,
                path: Path.join(basePath, extPath)
            });
        });

        return brambleExtensions;
    }

    exports.getExtensionList = function(params) {
        return _processDefaults(params.get("disableExtensions"));
    };
});
