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
        var brambleExtensions = extensionInfo.map(function(info) {
            return info.path;
        });

        if(disableExtensions) {
            disableExtensions.split(",").forEach(function (ext) {
                ext = ext.trim();
                var idx = brambleExtensions.indexOf(ext);
                if (idx > -1) {
                    console.log('[Brackets] Disabling default extension `' + ext + '`');
                    brambleExtensions.splice(idx, 1);
                }
            });
        }

        return brambleExtensions.map(function (ext) {
            return {
                name: ext,
                path: Path.join(basePath, ext)
            };
        });
    }

    exports.getExtensionList = function(params) {
        return _processDefaults(params.get("disableExtensions"));
    };
});
