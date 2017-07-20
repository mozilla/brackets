define([
    "thirdparty/filer/dist/filer.min",
    "EventEmitter",
    "bramble/client/PathCache"
], function(Filer, EventEmitter, PathCache) {
    "use strict";

    var Path = Filer.Path;

    function ProjectStats(options) {
        this.root = options.root;
        this.capacity = options.capacity;
    }
    ProjectStats.prototype = new EventEmitter();
    ProjectStats.prototype.constructor = ProjectStats;

    // (Re)Initialize the ProjectStats instance with a new filesystem.
    ProjectStats.prototype.init = function(fs, callback) {
        var self = this;

        self.cache = new PathCache();
        self.overCapacity = false;

        self.wrapFileSystem(fs);

        function addSize(path, next) {
            // ignore directories and do nothing
            if (/\/$/.test(path)){
                return next();
            }

            fs.stat(path, function(err, stats){
                if (err){
                    return next(err);
                }

                self.cache.add(path, stats.size);
                self.checkCapacity();

                next();
            });
        }

        // walk the root
        var shell = new fs.Shell();
        shell.find(self.root, { exec:addSize }, callback);
    };

    ProjectStats.prototype.wrapFileSystem = function(fs) {
        var self = this;
        self.fs = fs;

        // original unlink
        var _innerUnlink = fs.unlink;
        // overwrite unlink function to do the bookkeeping of project state and call original unlink.
        fs.unlink = function(pathname, callback){
            _innerUnlink.call(fs, pathname, function(err){
                // only update cache once original was successfull
                if (!err){
                    self.cache.remove(pathname);
                    self.checkCapacity();
                }
                callback(err);
            });
        };

        // original writeFile
        var _innerWriteFile = fs.writeFile;
        // overwrite original writeFile and add bookkeeping of project state and call original writeFile.
        fs.writeFile = function(filename, data, options, callback){
            if (typeof options === "function"){
                callback = options;
                options = {};
            }

            _innerWriteFile.call(fs, filename, data, options, function(err){
                // only update cache once original was successfull
                if (!err){
                    self.cache.add(filename, data.length);
                    self.checkCapacity();
                }
                callback(err);
            });
        };

        // original rename
        var _innerRename = fs.rename;
        // overwrite original rename and add bookkeeping of project state and call original rename.
        // this is essential because we don't want to lose track of file's size for renamed files.
        fs.rename = function(oldPath, newPath, callback){
            _innerRename.call(fs, oldPath, newPath, function(err){
                // only update cache once original was successfull
                if (!err){
                    self.cache.rename(oldPath, newPath);
                }
                callback(err);
            });
        };
    };

    // Monitor disk activity and trigger when we go over (or back under) capacity.
    ProjectStats.prototype.checkCapacity = function() {
        var size = this.getTotalProjectSize();
        var diff = this.capacity - size;
        var percentUsed = size / this.capacity;

        this.trigger("projectSizeChange", [size, percentUsed]);

        if (size >= this.capacity && !this.overCapacity) {
            this.overCapacity = true;
            this.trigger("capacityStateChange", [this.overCapacity, diff]);
        } else if(size < this.capacity && this.overCapacity) {
            this.overCapacity = false;
            this.trigger("capacityStateChange", [this.overCapacity, diff]);
        }
    };

    ProjectStats.prototype.getTotalProjectSize = function() {
        return this.cache.getTotalBytes();
    };

    ProjectStats.prototype.getFileCount = function() {
        return this.cache.getFileCount();
    };

    ProjectStats.prototype.hasIndexFile = function() {
        var index = Path.join(this.root, "index.html");
        return this.cache.hasPath(index);
    };

    return ProjectStats;
});
