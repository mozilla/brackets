/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*eslint no-fallthrough: "error"*/
/*global define */
define(function (require, exports, module) {
    "use strict";

    var LanguageManager = require('language/LanguageManager');
    var Sizes = require("filesystem/impls/filer/lib/Sizes");
    var Strings = require("strings");
    var StringUtils = require("utils/StringUtils");
    var FilerUtils = require('filesystem/impls/filer/FilerUtils');
    var isAnimated = require("isAnimated");
    var Path = FilerUtils.Path;

    function _getLanguageId(ext) {
        ext = FilerUtils.normalizeExtension(ext, true);
        var language = LanguageManager.getLanguageForExtension(ext);
        return language ? language.getId() : "";
    }

    function _lookupMimeType(ext) {
        ext = FilerUtils.normalizeExtension(ext);

        switch(ext) {

        // HTML
        case '.html':
        // fallsthrough
        case '.htmls':
        // fallsthrough
        case '.htm':
        // fallsthrough
        case '.htx':
            return 'text/html';

        // CSS
        case '.less':
        // fallsthrough
        case '.css':
            return 'text/css';

        // Scripts and Text
        case '.jsx':
        // fallsthrough
        case '.js':
            return 'text/javascript';
        case '.json':
            return 'application/javascript';
        case '.txt':
        // fallsthrough
        case '.markdown':
        // fallsthrough
        case '.md':
        // fallsthrough
        case '.ini':
        // fallsthrough
        case '.cfg':
            return 'text/plain';

        // Images
        case '.ico':
            return 'image/x-icon';
        case '.bmp':
            return 'image/bmp';
        case '.svg':
            return 'image/svg+xml';
        case '.apng':
        // fallsthrough
        case '.png':
            return 'image/png';
        case '.ico':
            return 'image/x-icon';
        case '.jpg':
        // fallsthrough
        case '.jpe':
        // fallsthrough
        case '.jpeg':
            return 'image/jpeg';
        case '.gif':
            return 'image/gif';

        // Video: some of these media types can be video or audio, prefer video.
        case '.mp4':
            return 'video/mp4';
        case '.ogv':
            return 'video/ogg';
        case '.webm':
            return 'video/webm';

        // Audio
        case '.oga':
        // fallsthrough
        case '.ogg':
            return 'audio/ogg';
        case '.mpa':
        // fallsthrough
        case '.mp3':
            return 'audio/mpeg';
        case '.wave':
        // fallsthrough
        case '.wav':
            return 'audio/wav';

        // Web Fonts
        case '.eot':
            return 'application/vnd.ms-fontobject';
        case '.otf':
            return 'application/x-font-opentype';
        case '.ttf':
            return 'application/x-font-ttf';
        case '.woff':
            return 'application/font-woff';
        }

        // Default: binary
        return 'application/octet-stream';
    }

    function FileInfo(ext) {
        var mimeType = this.mimeType = _lookupMimeType(ext);
        var parts = mimeType.split("/");
        this.type = parts[0];
        this.subType = parts[1];
    }

    module.exports = {
        isImage: function(ext) {
            var info = new FileInfo(ext);
            return info.type === "image";
        },

        isVideo: function(ext) {
            var info = new FileInfo(ext);
            return info.type === "video";
        },

        isAudio: function(ext) {
            var info = new FileInfo(ext);
            return info.type === "audio";
        },

        isResizableImage: function(ext) {
            ext = FilerUtils.normalizeExtension(ext);
            return ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif';
        },

        isAnimatedImage: function(data) {            
            return isAnimated(data);
        },

        isHTML: function(ext) {
            var id = _getLanguageId(ext);
            return id === "html";
        },

        isCSS: function(ext) {
            var id = _getLanguageId(ext);
            return id === "css";
        },

        isScript: function(ext) {
            var info = new FileInfo(ext);
            return info.subType === "javascript";
        },

        needsRewriting: function(ext) {
            return this.isHTML(ext) || this.isCSS(ext);
        },

        isMarkdown: function(ext) {
            var id = _getLanguageId(ext);
            return id === "markdown";
        },

        isPDF: function(ext) {
            ext = FilerUtils.normalizeExtension(ext);
            return ext === ".pdf";
        },

        isArchive: function(ext) {
            ext = FilerUtils.normalizeExtension(ext);
            return ext === '.zip' || ext === '.tar';
        },

        isFont: function(ext) {
            ext = FilerUtils.normalizeExtension(ext);
            switch(ext) {
            case '.eot':
            // fallsthrough
            case '.otf':
            // fallsthrough
            case '.ttf':
            // fallsthrough
            case '.woff':
                return true;
            default:
                return false;
            }
        },

        mimeFromExt: function(ext) {
            return _lookupMimeType(ext);
        },

        // Whether or not this is a text/* mime type
        isTextType: function(mime) {
            return (/^text/).test(mime);
        },

        // Check if the file can be read in utf8 encoding
        isUTF8Encoded: function(ext) {
            var mime = this.mimeFromExt(ext);
            return this.isTextType(mime);
        },

        // Test if the given URL is really a relative path (into the fs)
        isRelativeURL: function(url) {
            if(!url) {
                return false;
            }

            return !(/\:?\/\//.test(url) || /\s*data\:/.test(url));
        },

        // Test for a Blob URL, eg: blob:http://localhost:8000/bf64f1e0-044d-4673-ba7d-156251db09f8
        isBlobURL: function(url) {
            if(!url) {
                return false;
            }

            return /^blob\:/.test(url);
        },

        /**
         * Determine whether we want to allow a file to be imported based on its size
         */
        shouldRejectFile: function(filename, size) {
            var ext = Path.extname(filename);
            var mime = this.mimeFromExt(ext);
            var isArchive = this.isArchive(ext);

            var sizeLimit;
            if(this.isResizableImage(ext)) {
                sizeLimit = Sizes.RESIZABLE_IMAGE_FILE_LIMIT_MB;
            } else if(isArchive) {
                sizeLimit = Sizes.ARCHIVE_FILE_LIMIT_MB;
            } else {
                sizeLimit = Sizes.REGULAR_FILE_SIZE_LIMIT_MB;
            }
            var sizeLimitMb = (sizeLimit / (Sizes.MB)).toString();

            if (size > sizeLimit) {
                return new Error(StringUtils.format(Strings.DND_MAX_SIZE_EXCEEDED, sizeLimitMb));
            }

            return null;
        },

        /**
         * Test if image data size is too big (250K)
         */
        isImageTooLarge: function(byteLength) {
            return byteLength > Sizes.RESIZED_IMAGE_TARGET_SIZE_KB;
        }

    };
});
