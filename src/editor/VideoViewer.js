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
        VideoViewTemplate   = require("text!htmlContent/video-view.html"),
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
    function _getVideoUrl(file) {
        return UrlCache.getUrl(file.fullPath);
    }

    // Get a URL out of the cache that you can use in the project HTML
    function _getLocalVideoUrl(file) {
        var root = StartupState.project("root");
        return file.fullPath.replace(root,"").replace("/","");
    }

    /**
     * Check if it's a video file
     */
    function isVideo(fullPath) {
        return Content.isVideo(Path.extname(fullPath));
    }

    /**
     * VideoView objects are constructed when a video is opened
     * @see {@link Pane} for more information about where VideoViews are rendered
     *
     * @constructor
     * @param {!File} file - The video file object to render
     * @param {!jQuery} container - The container to render the video view in
     */
    function VideoView(file, $container) {
        var that = this;

        this.file = file;
        this.container = $container;

        // Set defaults, and keep track of which video element attributes are enabled.
        this.videoTagSettings = {
            controls: true,
            autoplay: false,
            loop: false,
            muted: false
        };

        // Gets the video type for sample markup
        this.videoType = Content.mimeFromExt(Path.extname(this.file.fullPath));

        this.$el = $(Mustache.render(VideoViewTemplate, {
            videoUrl: _getVideoUrl(file),
            videoType: this.videoType,
            Strings: Strings
        }));

        $container.append(this.$el);

        this._naturalWidth = 0;
        this._naturalHeight = 0;

        this.relPath = ProjectManager.makeProjectRelativeIfPossible(this.file.fullPath);

        this.$videoEl = this.$el.find("video");
        this.$videoWrapperEl = this.$el.find(".video-wrapper");
        this.$videoMarkupEl = this.$el.find("pre");
        this.$videoData = this.$el.find(".video-data-content");

        this.$videoEl.one("canplay", _.bind(this._onVideoLoaded, this));
        this.$videoEl.on("error", _.bind(console.error, console));

        this.$el.find(".tag-options").on("change", "input", function(){
            var attribute = $(this).attr("setting");
            var isEnabled = $(this).is(":checked");
            that.videoTagSettings[attribute] = isEnabled;
            that.updateVideoTagMarkup(true);
        });

        this.$videoEl.attr("src", _getVideoUrl(this.file));
        this.updateVideoTagMarkup();
        _viewers[file.fullPath] = this;
    }

    // Updates the markup used in the preview & the sample markup below
    VideoView.prototype.updateVideoTagMarkup = function(reload){
        var videoTagAttributesString = "";

        for(var k in this.videoTagSettings) {
            if(this.videoTagSettings[k]) {
                videoTagAttributesString = videoTagAttributesString + " " + k;
                this.$videoEl.attr(k,"");
            } else {
                this.$videoEl.removeAttr(k);
            }
        }

        var videoTagMarkup =
            '<video'+ videoTagAttributesString +'>\n' +
            '  <source src="'+ _getLocalVideoUrl(this.file) + '" type="' + this.videoType + '">\n'+
            '</video>';

        this.$videoMarkupEl.text(videoTagMarkup);

        // Reloads the video when one of the attributes is changed
        // so that the preview reflects the changes
        if(reload) {
            this.$videoMarkupEl.one("animationend",function(){
                $(this).removeClass("pop");
            });

            this.$videoMarkupEl.addClass("pop");

            var videoWrapperHeight = this.$videoWrapperEl.height();

            this.$videoWrapperEl.css("min-height", videoWrapperHeight);
            this.$videoEl.one("canplay", _.bind(this._onVideoReloaded, this));
            this.$videoEl[0].load();
        }
    };


    /**
     * DocumentManger.fileNameChange handler - when an video is renamed, we must
     * update the view
     *
     * @param {jQuery.Event} e - event
     * @param {!string} oldPath - the name of the file that's changing changing
     * @param {!string} newPath - the name of the file that's changing changing
     * @private
     */
    VideoView.prototype._onFilenameChange = function (e, oldPath, newPath) {
        /*
         * File objects are already updated when the event is triggered
         * so we just need to see if the file has the same path as our video
         */
        if (this.file.fullPath === newPath) {
            this.relPath = ProjectManager.makeProjectRelativeIfPossible(newPath);
        }
    };


    /* Removes min-height property */
    VideoView.prototype._onVideoReloaded = function (e) {
        this.$videoWrapperEl.css("min-height", "auto");
    };

    /**
     * <video>.on("canplay") handler - updates content of the video view
     *                            initializes computed values
     *                            installs event handlers
     * @param {Event} e - event
     * @private
     */
    VideoView.prototype._onVideoLoaded = function (e) {
        this._naturalWidth = e.target.videoWidth;
        this._naturalHeight = e.target.videoHeight;

        var extension = FileUtils.getFileExtension(this.file.fullPath);
        var stringFormat = Strings.IMAGE_DIMENSIONS;
        var dimensionString = StringUtils.format(stringFormat, this._naturalWidth, this._naturalHeight);

        var that = this;

        this.file.stat(function (err, stat) {
            var sizeString = "";
            if (stat.size) {
                sizeString = " <span class='divider'>&bull;</span> " + StringUtils.prettyPrintBytes(stat.size, 2);
                dimensionString = dimensionString + sizeString;
            }
            that.$videoData.html(dimensionString);
        });

        DocumentManager.on("fileNameChange.VideoView", _.bind(this._onFilenameChange, this));
    };

    /**
     * View Interface functions
     */

    /*
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    VideoView.prototype.getFile = function () {
        return this.file;
    };

    /*
     * Updates the layout of the view
     */
    VideoView.prototype.updateLayout = function () {
        return;
    };

    /*
     * Destroys the view
     */
    VideoView.prototype.destroy = function () {
        delete _viewers[this.file.fullPath];
        DocumentManager.off(".VideoView");
        this.$videoEl.off(".VideoView");
        this.$el.remove();
    };

    /*
     * Refreshes the video preview with what's on disk
     */
    VideoView.prototype.refresh = function () {
        // Update the DOM node with the src URL
        this.$videoEl.attr("src", _getVideoUrl(this.file));
    };

    /*
     * Creates a video view object and adds it to the specified pane
     * @param {!File} file - the file to create an video of
     * @param {!Pane} pane - the pane in which to host the view
     * @return {jQuery.Promise}
     */
    function _createVideoView(file, pane) {
        var view = pane.getViewForPath(file.fullPath);

        if (view) {
            pane.showView(view);
        } else {
            view = new VideoView(file, pane.$content);
            pane.addView(view, true);
        }
        return new $.Deferred().resolve(file).promise();
    }

    /**
     * Handles file system change events so we can refresh
     *  video viewers for the files that changed on disk due to external editors
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
     * so we can refresh the view when changes are made to the video in an external editor
     */
    FileSystem.on("change", _handleFileSystemChange);

    /*
     * Initialization, register our view factory
     */
    MainViewFactory.registerViewFactory({
        canOpenFile: function (fullPath) {
            return isVideo(fullPath);
        },
        openFile: function (file, pane) {
            return _createVideoView(file, pane);
        }
    });

    /*
     * This is for extensions that want to create a
     * view factory based on ImageViewer
     */
    exports.VideoView = VideoView;
});
