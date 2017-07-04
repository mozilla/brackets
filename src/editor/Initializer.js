/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var Content = require("filesystem/impls/filer/lib/content");
    var async = require("filesystem/impls/filer/lib/async");
    var BracketsFiler = require("filesystem/impls/filer/BracketsFiler");
    var UrlCache = require("filesystem/impls/filer/UrlCache");
    var Path = BracketsFiler.Path;
    var Transforms = require("filesystem/impls/filer/lib/transforms");
    var StartupState = require("bramble/StartupState");
    var decodePath = require("filesystem/impls/filer/FilerUtils").decodePath;

    // Walk the project root dir and make sure we have URLs generated for
    // all file paths.  Skip CSS and HTML files, since we need to rewrite them
    // before they are useful (e.g., for linked files within them).
    exports.initialize = function(callback) {
        var fs = BracketsFiler.fs();
        function _load(dirPath, callback) {
            fs.readdir(dirPath, function(err, entries) {
                if(err) {
                    return callback(err);
                }

                function _getUrl(name, callback) {
                    name = Path.join(dirPath, name);
                    fs.stat(name, function(err, stats) {
                        if(err) {
                            return callback(err);
                        }
                        if(stats.type === 'DIRECTORY') {
                            _load(name, callback);
                        } else {
                            var decodedFilename = decodePath(name);
                            callback(decodedFilename);
                        }
                    });
                }
                for(var i = 0; i<entries.length; i++) {
                    _getUrl(entries[i], callback);
                }
            //    async.eachSeries(entries, _getUrl, callback);
            });
        }

        _load(StartupState.project("root"), callback);
    };
});
