/*
 * Copyright (c) 2012 - present Adobe Systems Incorporated. All rights reserved.
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

    var InlineWidget    =  brackets.getModule("editor/InlineWidget").InlineWidget;
    var BoxModelUtils   =  require("BoxModelUtils");
    var BoxModelEditor  =  require("BoxModelEditor").BoxModelEditor;
    var EditorManager   =  brackets.getModule("editor/EditorManager");
    var ExtensionUtils  =  brackets.getModule("utils/ExtensionUtils");
    var properties      =  JSON.parse(require("text!BoxModelProperties.json"));

    /** @const @type {number} */
    var DEFAULT_BOXMODEL  = "5px"; // This is the default value of the BoxModel 

    /** @type {number} Global var used to provide a unique ID for each BoxModel editor instance's _origin field. */
    var lastOriginId = 1;

    /**
     * Inline widget containing a BoxModelEditor control
     * @param {!string} BoxModel  Initially selected BoxModel
     * @param {!CodeMirror.TextMarker} marker
     */
    function InlineBoxModelEditor(BoxModel, marker, type, iconClassName) {
        this._BoxModel = BoxModel;
        this._marker = marker;
        this._isOwnChange = false;
        this._isHostChange = false;
        this._origin = "+InlineBoxModelEditor_" + (lastOriginId++);
        this.type = type;
        this.iconClassName = iconClassName;

        this._handleBoxModelChange = this._handleBoxModelChange.bind(this);
        this._handleHostDocumentChange = this._handleHostDocumentChange.bind(this);

        InlineWidget.call(this);
    }

    InlineBoxModelEditor.prototype = Object.create(InlineWidget.prototype);
    InlineBoxModelEditor.prototype.constructor = InlineBoxModelEditor;
    InlineBoxModelEditor.prototype.parentClass = InlineWidget.prototype;

    /** @type {!BoxModelEditor} BoxModelEditor instance */
    InlineBoxModelEditor.prototype.BoxModelEditor = null;

    /**
     * Range of code we're attached to; _marker.find() may by null if sync is lost.
     * @type {!CodeMirror.TextMarker}
     */
    InlineBoxModelEditor.prototype._marker = null;

    /** @type {boolean} True while we're syncing a BoxModelEditor change into the code editor */
    InlineBoxModelEditor.prototype._isOwnChange = null;

    /** @type {boolean} True while we're syncing a code editor change into the BoxModelEditor*/
    InlineBoxModelEditor.prototype._isHostChange = null;

    /** @type {number} ID used to identify edits coming from this inline widget for undo batching */
    InlineBoxModelEditor.prototype._origin = null;


    /**
     * Returns the current text range of the BoxModel value we're attached to, or null if
     * we've lost sync with what's in the code.
     * @return {?{start:{line:number, ch:number}, end:{line:number, ch:number}}}
     */
    InlineBoxModelEditor.prototype.getCurrentRange = function () {
        var pos, start, end;

        pos = this._marker && this._marker.find();

        start = pos && pos.from;
        if (!start) {
            return null;
        }

        end = pos.to;
        if (!end) {
            end = {line: start.line};
        }

        // Even if we think we have a good range end, we want to run the
        // regexp match to see if there's a valid match that extends past the marker.
        // This can happen if the user deletes the end of the existing BoxModel value and then
        // types some more.

        // Manually find the position of the first occurance of BoxModel value in the line
        // because using this._maker.find() does not return expected value
        // using this as a work around
        var line = this.hostEditor.document.getLine(start.line);
        for(var i = line.indexOf(":")+1; i<line.length;i++){
            if(line[i]!==" "){
                start.ch = i;
                break;
            }
        }

        var  matches = line.substr(start).match(BoxModelUtils.BOXMODEL_VALUE_REGEX);

        // Note that end.ch is exclusive, so we don't need to add 1 before comparing to
        // the matched length here.
        if (matches && (end.ch === undefined || end.ch - start.ch < matches[0].length)) {
            end.ch = start.ch + matches[0].length;
            this._marker.clear();
            this._marker = this.hostEditor._codeMirror.markText(start, end);
        }

        if (end.ch === undefined) {
            // We were unable to resync the marker.
            return null;
        } else {
            return {start: start, end: end};
        }
    };

    /**
     * When the selected BoxModel value changes, update text in code editor
     * @param {!string} BoxModelString
     */
    InlineBoxModelEditor.prototype._handleBoxModelChange = function (BoxModelString) {
        var self = this;
        if (BoxModelString.replace(";",'') !== this._BoxModel) {
            var range = this.getCurrentRange();
            if (!range) {
                return;
            }

            // Don't push the change back into the host editor if it came from the host editor.
        if (!this._isHostChange) {
            var endPos = {
                line: range.start.line,
                ch: range.start.ch + BoxModelString.length
            };

            this._isOwnChange = true;
            this.hostEditor.document.batchOperation(function () {
                //select current text and replace with new value
                range.end.ch-=1;
                self.hostEditor.setSelection(range.start, range.end); // workaround for #2805
                self.hostEditor.document.replaceRange(BoxModelString, range.start, range.end, self._origin);
                if (self._marker) {
                    self._marker.clear();
                    self._marker = self.hostEditor._codeMirror.markText(range.start, endPos);
                }
            });
            this._isOwnChange = false;
          }
        
        this._BoxModel = BoxModelString.replace(";",'');
        }
    };

    /**
     * @override
     * @param {!Editor} hostEditor
     */
    InlineBoxModelEditor.prototype.load = function (hostEditor) {
        InlineBoxModelEditor.prototype.parentClass.load.apply(this, arguments);
        this.BoxModelEditor = new BoxModelEditor(this.$htmlContent, this._BoxModel, this._handleBoxModelChange, this.type, this.iconClassName);
    };

    /**
     * @override
     * Perform sizing & focus once we've been added to Editor's DOM
     */
    InlineBoxModelEditor.prototype.onAdded = function () {
        InlineBoxModelEditor.prototype.parentClass.onAdded.apply(this, arguments);
        var doc = this.hostEditor.document;
        doc.addRef();
        doc.on("change", this._handleHostDocumentChange);
        this.hostEditor.setInlineWidgetHeight(this, this.BoxModelEditor.$element.outerHeight() + 50, true);
        this.BoxModelEditor.focus();
    };

    /**
     * @override
     * Called whenever the inline widget is closed, whether automatically or explicitly
     */
    InlineBoxModelEditor.prototype.onClosed = function () {
        InlineBoxModelEditor.prototype.parentClass.onClosed.apply(this, arguments);
        if (this._marker) {
            this._marker.clear();
        }
        var doc = this.hostEditor.document;
        doc.off("change", this._handleHostDocumentChange);
        doc.releaseRef();
    };

    /**
     * When text in the code editor changes, update BoxModel UIs to reflect it
     */
    InlineBoxModelEditor.prototype._handleHostDocumentChange = function () {
        // Don't push the change into the BoxModel editor if it came from the BoxModel editor.
        if (this._isOwnChange) {
            return;
        }
        var range = this.getCurrentRange();
        if (range) {
            var newBoxModel = this.hostEditor.document.getRange(range.start, range.end);
            if (newBoxModel !== this._BoxModel) {
                if (this.BoxModelEditor.isValidBoxModelString(newBoxModel)) {
                    this._isHostChange = true;
                    this.BoxModelEditor.updateValues(newBoxModel);
                    this._isHostChange = false;
                }
            }
        } else {
            // The edit caused our range to become invalid. Close the editor.
            this.close();
        }
    };

    exports.InlineBoxModelEditor = InlineBoxModelEditor;
});

