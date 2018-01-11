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
    var PaddingUtils    =  require("PaddingUtils");
    var PaddingEditor   =  require("PaddingEditor").PaddingEditor;
    var EditorManager   =  brackets.getModule("editor/EditorManager");
    var ExtensionUtils  =  brackets.getModule("utils/ExtensionUtils");
    var properties      =  JSON.parse(require("text!PaddingProperties.json"));

    /** @const @type {number} */
    var DEFAULT_PADDING  = "5px"; // This is the default value of the padding 

    /** @type {number} Global var used to provide a unique ID for each padding editor instance's _origin field. */
    var lastOriginId = 1;

    /**
     * Inline widget containing a paddingEditor control
     * @param {!string} padding  Initially selected padding
     * @param {!CodeMirror.TextMarker} marker
     */
    function InlinePaddingEditor(padding, marker) {
        this._padding = padding;
        this._marker = marker;
        this._isOwnChange = false;
        this._isHostChange = false;
        this._origin = "+InlinePaddingEditor_" + (lastOriginId++);

        this._handlePaddingChange = this._handlePaddingChange.bind(this);
        this._handleHostDocumentChange = this._handleHostDocumentChange.bind(this);

        InlineWidget.call(this);
    }

    InlinePaddingEditor.prototype = Object.create(InlineWidget.prototype);
    InlinePaddingEditor.prototype.constructor = InlinePaddingEditor;
    InlinePaddingEditor.prototype.parentClass = InlineWidget.prototype;

    /** @type {!paddingEditor} paddingEditor instance */
    InlinePaddingEditor.prototype.paddingEditor = null;

    /**
     * Range of code we're attached to; _marker.find() may by null if sync is lost.
     * @type {!CodeMirror.TextMarker}
     */
    InlinePaddingEditor.prototype._marker = null;

    /** @type {boolean} True while we're syncing a paddingEditor change into the code editor */
    InlinePaddingEditor.prototype._isOwnChange = null;

    /** @type {boolean} True while we're syncing a code editor change into the paddingEditor*/
    InlinePaddingEditor.prototype._isHostChange = null;

    /** @type {number} ID used to identify edits coming from this inline widget for undo batching */
    InlinePaddingEditor.prototype._origin = null;


    /**
     * Returns the current text range of the padding value we're attached to, or null if
     * we've lost sync with what's in the code.
     * @return {?{start:{line:number, ch:number}, end:{line:number, ch:number}}}
     */
    InlinePaddingEditor.prototype.getCurrentRange = function () {
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
        // This can happen if the user deletes the end of the existing padding value and then
        // types some more.

        // Manually find the position of the first occurance of padding value in the line
        // because using this._maker.find() does not return expected value
        // using this as a work around
        var line = this.hostEditor.document.getLine(start.line);
        for(var i = line.indexOf(":")+1; i<line.length;i++){
            if(line[i]!==" "){
                start.ch = i;
                break;
            }
        }

        var  matches = line.substr(start).match(PaddingUtils.PADDING_VALUE_REGEX);

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
     * When the selected padding value changes, update text in code editor
     * @param {!string} paddingString
     */
    InlinePaddingEditor.prototype._handlePaddingChange = function (paddingString) {
        var self = this;
        if (paddingString.replace(";",'') !== this._padding) {
            var range = this.getCurrentRange();
            if (!range) {
                return;
            }

            // Don't push the change back into the host editor if it came from the host editor.
        if (!this._isHostChange) {
            var endPos = {
                line: range.start.line,
                ch: range.start.ch + paddingString.length
            };

            this._isOwnChange = true;
            this.hostEditor.document.batchOperation(function () {
                //select current text and replace with new value
                range.end.ch-=1;
                self.hostEditor.setSelection(range.start, range.end); // workaround for #2805
                self.hostEditor.document.replaceRange(paddingString, range.start, range.end, self._origin);
                if (self._marker) {
                    self._marker.clear();
                    self._marker = self.hostEditor._codeMirror.markText(range.start, endPos);
                }
            });
            this._isOwnChange = false;
          }
        
        this._padding = paddingString.replace(";",'');
        }
    };

    /**
     * @override
     * @param {!Editor} hostEditor
     */
    InlinePaddingEditor.prototype.load = function (hostEditor) {
        InlinePaddingEditor.prototype.parentClass.load.apply(this, arguments);
        this.paddingEditor = new PaddingEditor(this.$htmlContent, this._padding, this._handlePaddingChange);
    };

    /**
     * @override
     * Perform sizing & focus once we've been added to Editor's DOM
     */
    InlinePaddingEditor.prototype.onAdded = function () {
        InlinePaddingEditor.prototype.parentClass.onAdded.apply(this, arguments);
        var doc = this.hostEditor.document;
        doc.addRef();
        doc.on("change", this._handleHostDocumentChange);
        this.hostEditor.setInlineWidgetHeight(this, this.paddingEditor.$element.outerHeight() + 50, true);
        this.paddingEditor.focus();
    };

    /**
     * @override
     * Called whenever the inline widget is closed, whether automatically or explicitly
     */
    InlinePaddingEditor.prototype.onClosed = function () {
        InlinePaddingEditor.prototype.parentClass.onClosed.apply(this, arguments);
        if (this._marker) {
            this._marker.clear();
        }
        var doc = this.hostEditor.document;
        doc.off("change", this._handleHostDocumentChange);
        doc.releaseRef();
    };

    /**
     * When text in the code editor changes, update padding UIs to reflect it
     */
    InlinePaddingEditor.prototype._handleHostDocumentChange = function () {
        // Don't push the change into the padding editor if it came from the padding editor.
        if (this._isOwnChange) {
            return;
        }
        var range = this.getCurrentRange();
        if (range) {
            var newPadding = this.hostEditor.document.getRange(range.start, range.end);
            if (newPadding !== this._padding) {
                if (this.paddingEditor.isValidPaddingString(newPadding)) {
                    this._isHostChange = true;
                    this.paddingEditor.updateValues(newPadding);
                    this._isHostChange = false;
                }
            }
        } else {
            // The edit caused our range to become invalid. Close the editor.
            this.close();
        }
    };

    exports.InlinePaddingEditor = InlinePaddingEditor;
});

