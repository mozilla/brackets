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

    var UrlCache            = brackets.getModule("filesystem/impls/filer/UrlCache"),
        Mustache            = brackets.getModule("thirdparty/mustache/mustache"),
        StringUtils         = brackets.getModule("utils/StringUtils"),
        ThemePrefs          = brackets
                              .getModule("preferences/PreferencesManager")
                              .getExtensionPrefs("themes"),
        PDFViewTemplate     = require("text!htmlContent/pdf-view.html");

    var _viewers = {};

    // Track theme changes, and let any open PDF Viewers know
    ThemePrefs.on("change", "theme", function() {
        var theme = ThemePrefs.get("theme");

        Object.keys(_viewers).forEach(function(filename) {
            var viewer = _viewers[filename];
            var pdfWindow = viewer.$el[0].contentWindow;
            if(pdfWindow) {
                pdfWindow.postMessage("theme:" + theme, "*");
            }
        });
    });

    /**
     * PDFView objects are constructed when a PDF file is opened
     * @see {@link Pane} for more information about where PDFViews are rendered
     *
     * @constructor
     * @param {!File} file - The PDF file object to render
     * @param {!jQuery} container - The container to render the image view in
     */
    function PDFView(file, $container) {
        this.file = file;
        this.$container = $container;
        _viewers[file.fullPath] = this;
    }

    PDFView.prototype._init = function (deferred) {
        var self = this;
        var file = self.file;
        var $container = self.$container;

        file.stat(function(err, stats) {
            var fileSize = "";
            if(!err) {
                fileSize = StringUtils.prettyPrintBytes(stats._size, 2);
            }

            self.$el = $(Mustache.render(PDFViewTemplate, {
                pdfUrl: encodeURIComponent(UrlCache.getUrl(file.fullPath)),
                locale: brackets.getLocale(),
                fileSize: fileSize,
                theme: ThemePrefs.get("theme")
            }));
            $container.append(self.$el);

            deferred.resolve(file);
        });
    };

    /*
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    PDFView.prototype.getFile = function () {
        return this.file;
    };

    /*
     * Updates the layout of the view
     */
    PDFView.prototype.updateLayout = function () {
        var $container = this.$container;

        var pos = $container.position(),
            iWidth = $container.innerWidth(),
            iHeight = $container.innerHeight(),
            oWidth = $container.outerWidth(),
            oHeight = $container.outerHeight();

        // view is "position:absolute" so
        // we have to update the height, width and position
        this.$el.css({
            top: pos.top + ((oHeight - iHeight) / 2),
            left: pos.left + ((oWidth - iWidth) / 2),
            width: iWidth,
            height: iHeight
        });
    };

    /*
     * Destroys the view
     */
    PDFView.prototype.destroy = function () {
        delete _viewers[this.file.fullPath];
        this.$el.remove();
    };

    /*
     * Creates a PDF view object and adds it to the specified pane
     * @param {!File} file - the file to create an image of
     * @param {!Pane} pane - the pane in which to host the view
     * @return {jQuery.Promise}
     */
    function create(file, pane) {
        var view = pane.getViewForPath(file.fullPath);
        var deferred = new $.Deferred();

        if (view) {
            pane.showView(view);
            deferred.resolve(file);
        } else {
            view = new PDFView(file, pane.$content);
            view._init(deferred);
            pane.addView(view, true);
        }

        return deferred.promise();
    }

    exports.create = create;
});
