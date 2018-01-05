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

    var InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;
    var BorderRadiusUtils = require("BorderRadiusUtils");
    var BorderRadiusEditor = require("BorderRadiusEditor").BorderRadiusEditor;


    /** @const @type {number} */
    var DEFAULT_BORDER_RADIUS  = "30px";

    /** @type {number} Global var used to provide a unique ID for each borderRadius editor instance's _origin field. */
    var lastOriginId = 1;

    /**
     * Inline widget containing a BorderRadiusEditor control
     * @param {!string} borderRadius  Initially selected borderRadius
     * @param {!CodeMirror.TextMarker} marker
     */
    function InlineBorderRadiusEditor(borderRadius, marker) {
        this._borderRadius = borderRadius;
        this._marker = marker;
        this._isOwnChange = false;
        this._isHostChange = false;
        this._origin = "+InlineBorderRadiusEditor_" + (lastOriginId++);

        this._handleBorderRadiusChange = this._handleBorderRadiusChange.bind(this);
        this._handleHostDocumentChange = this._handleHostDocumentChange.bind(this);

        InlineWidget.call(this);
    }

    InlineBorderRadiusEditor.prototype = Object.create(InlineWidget.prototype);
    InlineBorderRadiusEditor.prototype.constructor = InlineBorderRadiusEditor;
    InlineBorderRadiusEditor.prototype.parentClass = InlineWidget.prototype;

    /** @type {!borderRaidusEditor} borderRadiusEditor instance */
    InlineBorderRadiusEditor.prototype.borderRaidusEditor = null;

    /**
     * Range of code we're attached to; _marker.find() may by null if sync is lost.
     * @type {!CodeMirror.TextMarker}
     */
    InlineBorderRadiusEditor.prototype._marker = null;

    /** @type {boolean} True while we're syncing a borderRadiusEditor change into the code editor */
    InlineBorderRadiusEditor.prototype._isOwnChange = null;

    /** @type {boolean} True while we're syncing a code editor change into the borderRadiusEditor*/
    InlineBorderRadiusEditor.prototype._isHostChange = null;

    /** @type {number} ID used to identify edits coming from this inline widget for undo batching */
    InlineBorderRadiusEditor.prototype._origin = null;


    /**
     * Returns the current text range of the border-radius value we're attached to, or null if
     * we've lost sync with what's in the code.
     * @return {?{start:{line:number, ch:number}, end:{line:number, ch:number}}}
     */
    InlineBorderRadiusEditor.prototype.getCurrentRange = function () {
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
        // This can happen if the user deletes the end of the existing border-radius value and then
        // types some more.

        //Manuelly find the position of the first occurance of radius value in the line
        //because using this._maker.find() does not return expected value
        //using this as a work around
        var line = this.hostEditor.document.getLine(start.line);
        for(var i = line.indexOf(":")+1; i<line.length;i++){
            if(line[i]!==" "){
                start.ch = i;
                break;
            }
        }

        var  matches = line.substr(start).match(BorderRadiusUtils.BORDER_RADIUS_VALUE_REGEX);

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
     * When the selected border-radius value changes, update text in code editor
     * @param {!string} borderRadiusString
     */
    InlineBorderRadiusEditor.prototype._handleBorderRadiusChange = function (borderRadiusString) {
        var self = this;
        if (borderRadiusString.replace(";",'') !== this._borderRadius) {
            var range = this.getCurrentRange();
            if (!range) {
                return;
            }

            // Don't push the change back into the host editor if it came from the host editor.
            if (!this._isHostChange) {
                var endPos = {
                        line: range.start.line,
                        ch: range.start.ch + borderRadiusString.length
                };

                this._isOwnChange = true;
                this.hostEditor.document.batchOperation(function () {
                    //select current text and replace with new value
                    range.end.ch-=1;
                    self.hostEditor.setSelection(range.start, range.end); // workaround for #2805
                    self.hostEditor.document.replaceRange(borderRadiusString, range.start, range.end, self._origin);
                    if (self._marker) {
                        self._marker.clear();
                        self._marker = self.hostEditor._codeMirror.markText(range.start, endPos);
                    }
                });
                this._isOwnChange = false;
            }
            this._borderRadius = borderRadiusString.replace(";",'');
        }
    };

    /**
     * @override
     * @param {!Editor} hostEditor
     */
    InlineBorderRadiusEditor.prototype.load = function (hostEditor) {
        InlineBorderRadiusEditor.prototype.parentClass.load.apply(this, arguments);
        this.borderRadiusEditor = new BorderRadiusEditor(this.$htmlContent, this._borderRadius, this._handleBorderRadiusChange);
    };

    /**
     * @override
     * Perform sizing & focus once we've been added to Editor's DOM
     */
    InlineBorderRadiusEditor.prototype.onAdded = function () {
        InlineBorderRadiusEditor.prototype.parentClass.onAdded.apply(this, arguments);
        var doc = this.hostEditor.document;
        doc.addRef();
        doc.on("change", this._handleHostDocumentChange);
        this.hostEditor.setInlineWidgetHeight(this, this.borderRadiusEditor.$element.outerHeight() + 50, true);
        this.borderRadiusEditor.focus();
    };

    /**
     * @override
     * Called whenever the inline widget is closed, whether automatically or explicitly
     */
    InlineBorderRadiusEditor.prototype.onClosed = function () {
        InlineBorderRadiusEditor.prototype.parentClass.onClosed.apply(this, arguments);
        if (this._marker) {
            this._marker.clear();
        }
        var doc = this.hostEditor.document;
        doc.off("change", this._handleHostDocumentChange);
        doc.releaseRef();
    };

    /**
     * When text in the code editor changes, update border-radius UIs to reflect it
     */
    InlineBorderRadiusEditor.prototype._handleHostDocumentChange = function () {
        // Don't push the change into the border-radius editor if it came from the border-radius editor.
        if (this._isOwnChange) {
            return;
        }
        var range = this.getCurrentRange();
        if (range) {
            var newBorderRadius = this.hostEditor.document.getRange(range.start, range.end);
            if (newBorderRadius !== this._borderRadius) {
                if (this.borderRadiusEditor.isValidBorderRadiusString(newBorderRadius)) {
                    this._isHostChange = true;
                    this.borderRadiusEditor.updateValues(newBorderRadius);
                    this._isHostChange = false;
                }
            }
        } else {
            // The edit caused our range to become invalid. Close the editor.
            this.close();
        }
    };

    exports.InlineBorderRadiusEditor = InlineBorderRadiusEditor;
});
