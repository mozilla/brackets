define([
    // Change this to filer vs. filer.min if you need to debug Filer
    "thirdparty/filer/dist/filer.min",
], function(Filer){
    "use strict";

    var ProjectStats = {};
    var Path = Filer.Path;
    var _root;

    // keep track of project state
    // host cache in the object should any other project states have to be added
    var _cache = {};

    var _fs = new Filer.FileSystem();
    var _shell = new _fs.Shell();
    ProjectStats.getFileSystem = function(){
        return _fs;
    };
    // NOTE: THIS WILL DESTROY DATA! For error cases only, or to wipe the disk.
    ProjectStats.formatFileSystem = function(flags, callback){
        _fs = new Filer.FileSystem(flags, callback);
        _shell = new _fs.Shell();
        return _fs;
    };

    // walk the whole file tree and record each path and file size
    ProjectStats.init = function(root, callback){
        function addSize(path, next){
            // ignore directories and do nothing
            if (path.endsWith("/")){
                return next();
            }

            _fs.stat(path, function(err, stats){
                if (err){
                    return next(err);
                }
                _cache[path] = stats.size;
                next();
            });
        }

        // original unlink
        var _innerUnlink = _fs.unlink;
        // overwrite unlink function to do the bookkeeping of project state and call original unlink.
        _fs.unlink = function(pathname, callback){
            _innerUnlink.call(_fs, pathname, function(err){
                // only update cache once original was successfull
                if (!err){
                    delete _cache[pathname];
                }
                callback(err);
            });
        };

        // original writeFile
        var _innerWriteFile = _fs.writeFile;
        // overwrite original writeFile and add bookkeeping of project state and call original writeFile.
        _fs.writeFile = function(filename, data, options, callback){
            if (typeof options === "function"){
                callback = options;
                options = {};
            }

            _innerWriteFile.call(_fs, filename, data, options, function(err){
                // only update cache once original was successfull
                if (!err){
                    _cache[filename] = data.length;
                }
                callback(err);
            });
        };

        // original rename
        var _innerRename = _fs.rename;
        // overwrite original rename and add bookkeeping of project state and call original rename.
        // this is essential because we don't want to lose track of file's size for renamed files.
        _fs.rename = function(oldPath, newPath, callback){
            _innerRename.call(_fs, oldPath, newPath, function(err){
                // only update cache once original was successfull
                if (!err){
                    _cache[newPath] = _cache[oldPath];
                    delete _cache[oldPath];
                }
                callback(err);
            });
        };

        // returns true/false depending on whether root/index.html exists
        ProjectStats.hasIndexFile = function(){
            if (!_root){
                return false;
            }

            var index = Path.join(_root, "index.html");
            // Loop through all paths, return true if one of them is root/index.html
            return !!(Object.keys(_cache)).find(function(path){
                return path === index;
            });
        };

        // returns bytes of files in the root
        ProjectStats.getTotalProjectSize = function(){
            // Sum up all sizes in the cache and return
            if (!_root){
                return 0;
            }

            return (Object.values(_cache)).reduce(function(acc, val){
                return acc + (val ? val : 0);
            });
        };

        // returns project file count
        ProjectStats.getFileCount = function(){
            if (!_root){
                return 0;
            }
            return Object.keys(_cache).length;
        };

        // reinitialize project stats
        _root = root;
        _cache = {};

        // walk the root
        _shell.find(_root, { exec:addSize }, callback);
    };

    return ProjectStats;
});
