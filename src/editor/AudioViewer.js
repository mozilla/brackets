/*
 * Copyright (c) 2013 - present Adobe Systems Incorporated. All rights reserved.
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

define(function (require, exports, module) {
    "use strict";

    var DocumentManager     = require("document/DocumentManager"),
        ViewTemplate        = require("text!htmlContent/audio-view.html"),
        ProjectManager      = require("project/ProjectManager"),
        PreferencesManager  = require("preferences/PreferencesManager"),
        MainViewFactory     = require("view/MainViewFactory"),
        Strings             = require("strings"),
        Filer               = require("filesystem/impls/filer/BracketsFiler"),
        Path                = Filer.Path,
        StringUtils         = require("utils/StringUtils"),
        FileSystem          = require("filesystem/FileSystem"),
        UrlCache            = require("filesystem/impls/filer/UrlCache"),
        FileUtils           = require("file/FileUtils"),
        Content             = require("filesystem/impls/filer/lib/content"),
        _                   = require("thirdparty/lodash"),
        Mustache            = require("thirdparty/mustache/mustache"),
        StartupState        = require("bramble/StartupState");

    var _viewers = {};

    // Get a URL out of the cache
    function _getFileUrl(file) {
        return UrlCache.getUrl(file.fullPath);
    }

    // Get a URL out of the cache that you can use in the project HTML
    function _getLocalFileUrl(file) {
        var root = StartupState.project("root");
        return encodeURI(file.fullPath.replace(root,"").replace("/",""));
    }

    /**
     * Check if it's a audio file
     */
    function isAudio(fullPath) {
        return Content.isAudio(Path.extname(fullPath));
    }

    /**
     * FileView objects are constructed when a audio is opened
     * @see {@link Pane} for more information about where FileViews are rendered
     *
     * @constructor
     * @param {!File} file - The audio file object to render
     * @param {!jQuery} container - The container to render the audio view in
     */
    function FileView(file, $container) {
        var that = this;
        this.file = file;
        this.container = $container;

        // Settings for the <audio> element
        this.tagSettings = {
            controls: true,
            autoplay: false,
            loop: false,
            muted: false
        };

        // Gets the file type for sample markup
        this.fileType = Content.mimeFromExt(Path.extname(this.file.fullPath));

        this.$el = $(Mustache.render(ViewTemplate, {
            fileUrl: _getFileUrl(file),
            fileType: this.fileType,
            Strings: Strings
        }));

        $container.append(this.$el);

        this.relPath = ProjectManager.makeProjectRelativeIfPossible(this.file.fullPath);

        this.$audioEl = this.$el.find("audio");
        this.$audioWrapperEl = this.$el.find(".audio-wrapper");
        this.$audioMarkupEl = this.$el.find("pre");
        this.$audioData = this.$el.find(".video-data-content");

        this.$audioEl.one("canplay", _.bind(this._onFileLoaded, this));
        this.$audioEl.on("error", _.bind(console.error, console));

        this.$el.find(".tag-options").on("change", "input", function(){
            var attribute = $(this).attr("setting");
            var isEnabled = $(this).is(":checked");
            that.tagSettings[attribute] = isEnabled;
            that.updateTagMarkup(true);
        });

        this.$audioEl.find("source").attr("src", _getFileUrl(this.file));
        this.updateTagMarkup();

        _viewers[file.fullPath] = this;

        // Update the page if the file is renamed
        this.fileChangeHandler = _.bind(this._onFilenameChange, this);
        DocumentManager.on("fileNameChange", this.fileChangeHandler);
    }

    // Updates the markup used in the preview & the sample markup below
    FileView.prototype.updateTagMarkup = function(reload){
        var tagAttributesString = "";

        for(var k in this.tagSettings) {
            if(this.tagSettings[k]) {
                tagAttributesString = tagAttributesString + " " + k;
                this.$audioEl.attr(k,"");
            } else {
                this.$audioEl.removeAttr(k);
            }
        }

        var tagMarkup =
            '<audio'+ tagAttributesString +'>\n' +
            '  <source src="'+ _getLocalFileUrl(this.file) + '" type="' + this.fileType + '">\n'+
            '</audio>';

        this.$audioMarkupEl.text(tagMarkup);

        // Reloads the audio when one of the attributes is changed
        // so that the preview reflects the changes
        if(reload) {
            this.$audioMarkupEl.one("animationend",function(){
                $(this).removeClass("pop");
            });

            this.$audioMarkupEl.addClass("pop");
            this.$audioEl.find("source").attr("src", _getFileUrl(this.file));
            this.$audioEl[0].load();
        }
    };


    /**
     * DocumentManger.fileNameChange handler - when the file is renamed we must update the vie
     *
     * @param {jQuery.Event} e - event
     * @param {!string} oldPath - the name of the file that's changing changing
     * @param {!string} newPath - the name of the file that's changing changing
     * @private
     */
    FileView.prototype._onFilenameChange = function (e, oldPath, newPath) {
        /*
         * File objects are already updated when the event is triggered
         * so we just need to see if the file has the same path as our video
         */
        if (this.file.fullPath === newPath) {
            this.relPath = ProjectManager.makeProjectRelativeIfPossible(newPath);
        }

        this.updateTagMarkup(true);
    };


    /**
     * <audio>.on("canplay") handler - updates content of the audio view
     *                            initializes computed values
     *                            installs event handlers
     * @param {Event} e - event
     * @private
     */
    FileView.prototype._onFileLoaded = function (e) {

        var extension = FileUtils.getFileExtension(this.file.fullPath);
        var that = this;

        this.file.stat(function (err, stat) {
            var sizeString = "";
            if (stat.size) {
                sizeString = StringUtils.prettyPrintBytes(stat.size, 2);
            }
            that.$audioData.html(sizeString);
        });
    };

    /**
     * View Interface functions
     */

    /*
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    FileView.prototype.getFile = function () {
        return this.file;
    };

    /*
     * Updates the layout of the view
     */
    FileView.prototype.updateLayout = function () {
        return;
    };

    /*
     * Destroys the view
     */
    FileView.prototype.destroy = function () {
        delete _viewers[this.file.fullPath];
        DocumentManager.off("fileNameChange", this.fileChangeHandler);
        this.$el.remove();
    };

    /*
     * Refreshes the audio preview with what's on disk
     */
    FileView.prototype.refresh = function () {
        // Update the DOM node with the src URL
        this.$audioEl.find("source").attr("src", _getFileUrl(this.file));
    };

    /*
     * Creates a audio view object and adds it to the specified pane
     * @param {!File} file - the file to create an audio of
     * @param {!Pane} pane - the pane in which to host the view
     * @return {jQuery.Promise}
     */
    function _createFileView(file, pane) {
        var view = pane.getViewForPath(file.fullPath);

        if (view) {
            pane.showView(view);
        } else {
            view = new FileView(file, pane.$content);
            pane.addView(view, true);
        }
        return new $.Deferred().resolve(file).promise();
    }

    /**
     * Handles file system change events so we can refresh
     *  audio viewers for the files that changed on disk due to external editors
     * @param {jQuery.event} event - event object
     * @param {?File} file - file object that changed
     * @param {Array.<FileSystemEntry>=} added If entry is a Directory, contains zero or more added children
     * @param {Array.<FileSystemEntry>=} removed If entry is a Directory, contains zero or more removed children
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
     * so we can refresh the view when changes are made to the audio in an external editor
     */
    FileSystem.on("change", _handleFileSystemChange);

    /*
     * Initialization, register our view factory
     */
    MainViewFactory.registerViewFactory({
        canOpenFile: function (fullPath) {
            return isAudio(fullPath);
        },
        openFile: function (file, pane) {
            return _createFileView(file, pane);
        }
    });

    /*
     * This is for extensions that want to create a
     * view factory based on ImageViewer
     */
    exports.AudioView = FileView;
});
