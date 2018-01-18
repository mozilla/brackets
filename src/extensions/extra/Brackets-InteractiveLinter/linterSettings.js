/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require/*, exports, module*/) {
    "use strict";

    var Dialogs         = brackets.getModule("widgets/Dialogs"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        FileUtils       = brackets.getModule("file/FileUtils"),
        Promise         = require("libs/js/spromise"),
        currentProject  = {},
        currentLinter   = {};


    function findFile(fileName, filePath, traverse) {
        var deferred = Promise.defer();

        function find(filePath) {
            if (!filePath) {
                return deferred.reject(false);
            }

            try {
                var file = FileSystem.getFileForPath(filePath + "/" + fileName);
                file.exists(function(err, exists) {
                    if (exists) {
                        deferred.resolve(file);
                    }
                    else if (err || !traverse || filePath.indexOf(currentProject.fullPath) === -1) {
                        deferred.reject(false);
                    }
                    else {
                        find(FileUtils.getParentPath(filePath));
                    }
                });
            }
            catch(ex) {
                deferred.reject(false);
            }
        }

        find(FileUtils.getDirectoryPath(filePath));
        return deferred.promise;
    }


    function readFile(file) {
        var deferred = Promise.defer();

        file.read(function(err, content /*, stat*/) {
            if (err) {
                deferred.reject(err);
                return;
            }

            deferred.resolve(content);
        });

        return deferred.promise;
    }


    function setSettings(settings) {
        var deferred = Promise.defer();
        settings = stripComments(settings);

        try {
            settings = JSON.parse(settings);
            deferred.resolve(settings);
        }
        catch(ex) {
            if (!settings) {
                deferred.resolve();
                return;
            }

            Dialogs.showModalDialog(
                "interactiveLinterErr",
                "Interactive Linter Error",
                "Error processing linter settings<br>" +
                ex.toString()
            );

            deferred.reject("Error processing linter settings");
        }

        return deferred.promise;
    }


    FileSystem.on("change", function(evt, file) {
        if (currentLinter.file && currentLinter.fileObject && file && file.fullPath === currentLinter.fileObject.fullPath) {
            loadFile().done(currentLinter.linter.lint);
        }
    });


    function loadFile() {
        var traverse = currentLinter.path.indexOf(currentProject.fullPath) !== -1;

        return findFile(currentLinter.file, currentLinter.path, traverse)
            .always(function(file) {
                currentLinter.fileObject = file;
            })
            .then(readFile, $.noop)
            .then(setSettings, $.noop)
            .always(function(settings) {
                currentLinter.settings = settings;
            });
    }


    function loadSettings(file, path, linter) {
        if (!file) {
            return Promise.resolve();
        }

        // Cache so that we are not loading up the same file when navigating in the same directory...
        if (path === currentLinter.path && file === currentLinter.file) {
            return Promise.resolve(currentLinter.settings);
        }

        currentLinter = {
            path: normalizePath(path),
            file: file,
            linter: linter
        };

        return loadFile();
    }


    /**
     * Make sure we only have forward slashes 
     */
    function normalizePath(path) {
        return path.replace(/[\/\\]/g, "/");
    }


    /**
     * Strips all commments from a json string.
     */
    function stripComments(text) {
        // Regex from requirejs.  Thanks James!
        return  (text || "").replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, "");
    }


    ProjectManager.on("projectOpen", function(e, project) {
        currentProject = project;
    });


    return {
        loadSettings: loadSettings
    };

});
