define(function() {
    "use strict";

    function PathCache() {
        this.paths = {};
    }
    PathCache.prototype.add = function(path, size) {
        this.paths[path] = size;
    };
    PathCache.prototype.remove = function(path) {
        delete this.paths[path];
    };
    PathCache.prototype.rename = function(oldPath, newPath) {
        this.paths[newPath] = this.paths[oldPath];
        delete this.paths[oldPath];
    };
    PathCache.prototype.getTotalBytes = function() {
        var paths = this.paths;

        return Object.keys(paths).reduce(function(sum, path) {
            return sum + paths[path];
        }, 0);
    };
    PathCache.prototype.getFileCount = function() {
        return Object.keys(this.paths).length;
    };
    PathCache.prototype.hasPath = function(path) {
        return !!this.paths[path];
    };

    return PathCache;
});
