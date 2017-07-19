/*
 * Copyright (c) 2013 Tomás Malbrán. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, unparam: true */
/*global define, $, window, brackets */

define(function (require, exports, module) {
    "use strict";

    var AppInit            = brackets.getModule("utils/AppInit"),
        ExtensionUtils     = brackets.getModule("utils/ExtensionUtils"),
        Mustache           = brackets.getModule("thirdparty/mustache/mustache"),
        StringUtils        = brackets.getModule("utils/StringUtils"),
        Strings            = brackets.getModule("strings"),
        DocumentManager    = brackets.getModule("document/DocumentManager"),
        MainViewFactory    = brackets.getModule("view/MainViewFactory"),
        ProjectManager     = brackets.getModule("project/ProjectManager"),
        FileSystem         = brackets.getModule("filesystem/FileSystem"),
        UrlCache           = brackets.getModule("filesystem/impls/filer/UrlCache"),
        Content            = brackets.getModule("filesystem/impls/filer/lib/content"),
        Path               = brackets.getModule("filesystem/impls/filer/BracketsFiler").Path,
        _                  = brackets.getModule("thirdparty/lodash"),
        FontHolderTemplate = require("text!htmlContent/font-holder.html");

    /** @type {Array.<FontView>} */
    var _viewers = {};

    // Get a name for this font for use in the CSS sample code
    function _getFontName(file) {
        var fileNameWithoutExtension = Path.basename(file.name).replace(Path.extname(file.name), "");
        fileNameWithoutExtension = fileNameWithoutExtension.replace(/\s+/g, "-").trim();
        return fileNameWithoutExtension;
    }

    // Get a URL out of the cache
    function _getUrl(path) {
        return UrlCache.getUrl(path);
    }

    /**
     * FontView objects are constructed when an font is opened
     * @constructor
     * @param {!File} file  The image file object to render
     * @param {!jQuery} container  The container to render the image view in
     */
    function FontView(file, $container) {
        this.file       = file;
        this.$container = $container;
        this.relPath    = ProjectManager.makeProjectRelativeIfPossible(this.file.fullPath);

        this._buildPage(this.file, this.$container, false);

        // Update the page if the file is renamed
        this.fileChangeHandler = _.bind(this._onFilenameChange, this);
        DocumentManager.on("fileNameChange", this.fileChangeHandler);

        _viewers[file.fullPath] = this;
    }


    // Updates the page markup
    FontView.prototype._buildPage = function (file, $container, fileRename) {

        // Since we are rebuilding the page by appending new markup
        // we have to remove the old viewer markup.

        if(fileRename && $container.find(".viewer-wrapper").length > 0) {
            $container.find(".viewer-wrapper").remove();
        }

        this.$el     = $(Mustache.render(FontHolderTemplate, {
            url      : _getUrl(this.file.fullPath),
            relPath  : this.relPath,
            fontName : _getFontName(this.file),
            now      : new Date().valueOf(),
            Strings  : Strings
        }));

        $container.append(this.$el);

        this.$fontFace    = this.$el.find(".font-face");
        this.$fontData    = this.$el.find(".font-data");

        this._updateStats();
    };


    /**
     * Updates the Font Stats
     */
    FontView.prototype._updateStats = function () {
        var self = this;
        this.file.stat(function (err, stat) {
            if (!err && stat._size) {
                var dataString = StringUtils.prettyPrintBytes(stat._size, 2);
                self.$fontData.text(dataString).attr("title", dataString);
            }
        });
    };

    /**
     * DocumentManger.fileNameChange handler - when a font is renamed, we must
     * update the view
     *
     * @param {jQuery.Event} e  event
     * @param {!string} oldPath  the name of the file that's changing changing
     * @param {!string} newPath  the name of the file that's changing changing
     * @private
     */
    FontView.prototype._onFilenameChange = function (e, oldPath, newPath) {
        // File objects are already updated when the event is triggered
        // so we just need to see if the file has the same path as our image
        if (this.file.fullPath === newPath) {
            this.relPath = ProjectManager.makeProjectRelativeIfPossible(newPath);
            this._buildPage(this.file, this.$container, true);
        }
    };

    /**
     * View Interface functions
     */

    /*
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    FontView.prototype.getFile = function () {
        return this.file;
    };

    /*
     * Updates the layout of the view
     */
    FontView.prototype.updateLayout = function () {
        var $container = this.$el.parent(),
            pos        = $container.position(),
            iWidth     = $container.innerWidth(),
            iHeight    = $container.innerHeight(),
            oWidth     = $container.outerWidth(),
            oHeight    = $container.outerHeight();

        // $view is "position:absolute" so
        //  we have to update the height, width and position
        this.$el.css({
            top    : pos.top  + ((oHeight - iHeight) / 2),
            left   : pos.left + ((oWidth  - iWidth)  / 2),
            width  : iWidth,
            height : iHeight
        });
    };

    /*
     * Destroys the view
     */
    FontView.prototype.destroy = function () {
        delete _viewers[this.file.fullPath];
        DocumentManager.off("fileNameChange", this.fileChangeHandler);
        this.$el.remove();
    };

    /*
     * Refreshes the image preview with what's on disk
     */
    FontView.prototype.refresh = function () {
        var noCacheUrl = _getUrl(this.file.fullPath),
            now        = new Date().valueOf();

        // Add a new param which will force chrome to re-read the image from disk
        noCacheUrl = noCacheUrl + "?ver=" + now;

        // Update the DOM node with the src URL
        this.$fontFace.html("@font-face {font-family:'FontDisplay';src: url('" + noCacheUrl + "');}");
        this._updateStats();
    };



    /**
     * Creates an image view object and adds it to the specified pane
     * @param {!File} file - the file to create an image of
     * @param {!Pane} pane - the pane in which to host the view
     * @return {jQuery.Promise}
     */
    function _createFontView(file, pane) {
        var view = pane.getViewForPath(file.fullPath);

        if (view) {
            pane.showView(view);
        } else {
            view = new FontView(file, pane.$content);
            pane.addView(view, true);
        }
        return new $.Deferred().resolve(file).promise();
    }

    /**
     * Handles file system change events so we can refresh image viewers for the files that changed on disk due to external editors
     * @param {jQuery.event} event  event object
     * @param {?File} file  file object that changed
     * @param {Array.<FileSystemEntry>=} added  If entry is a Directory, contains zero or more added children
     * @param {Array.<FileSystemEntry>=} removed  If entry is a Directory, contains zero or more removed children
     */
    function _handleFileSystemChange(event, entry, added, removed) {
        // this may have been called because files were added
        //  or removed to the file system.  We don't care about those
        if (!entry || entry.isDirectory) {
            return;
        }

        // Look for a viewer for the changed file
        var viewer = _viewers[entry.fullPath];

        // viewer found, call its refresh method
        if (viewer) {
            viewer.refresh();
        }
    }

    /*
     * Install an event listener to receive all file system change events
     * so we can refresh the view when changes are made to the image in an external editor
     */
    FileSystem.on("change", _handleFileSystemChange);

    /*
     * Initialization, register our view factory
     */
    MainViewFactory.registerViewFactory({
        canOpenFile: function (fullPath) {
            return Content.isFont(Path.extname(fullPath));
        },
        openFile: function (file, pane) {
            return _createFontView(file, pane);
        }
    });

    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "styles/main.less");
    });
});