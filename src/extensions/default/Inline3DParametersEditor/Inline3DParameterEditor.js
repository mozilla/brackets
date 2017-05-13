/*
 * File based on InlineColorEditor/InlineColorEditor.js
 */

define(function (require, exports, module) {
    "use strict";

    var InlineWidget            = brackets.getModule("editor/InlineWidget").InlineWidget,
        ParameterEditor         = require("ParameterEditor").ParameterEditor,
        Inline3dParametersUtils = require("Parameters3DUtils");

    /** @type {number} Global var used to provide a unique ID for each parameter editor instance's _origin field. */
    var lastOriginId = 1;

    /**
     * Inline widget containing a ParameterEditor control
     * @param {!string} parameters  Initial Parameters
     * @param {!CodeMirror.TextMarker} marker
     */
    function Inline3DParameterEditor(parameters, marker, tag) {
        this._handleParametersChange = this._handleParametersChange.bind(this);
        this._handleHostDocumentChange = this._handleHostDocumentChange.bind(this);
        this._parameters = parameters;
        this._marker = marker;
        this._tag = tag;
        this._isOwnChange = false;
        this._isHostChange = false;
        this._origin = "+InlineParameterditor_" + (lastOriginId++);

        InlineWidget.call(this);
    }

    Inline3DParameterEditor.prototype = Object.create(InlineWidget.prototype);
    Inline3DParameterEditor.prototype.constructor = Inline3DParameterEditor;
    Inline3DParameterEditor.prototype.parentClass = InlineWidget.prototype;

    Inline3DParameterEditor.prototype.ParameterEditor = null;

    Inline3DParameterEditor.prototype._parameters = null;

    /**
     * Range of code we're attached to; _marker.find() may by null if sync is lost.
     * @type {!CodeMirror.TextMarker}
     */
    Inline3DParameterEditor.prototype._marker = null;

    /** @type {boolean} True while we're syncing a parameter picker change into the code editor */
    Inline3DParameterEditor.prototype._isOwnChange = null;

    /** @type {boolean} True while we're syncing a code editor change into the parameter picker */
    Inline3DParameterEditor.prototype._isHostChange = null;

    /** @type {number} ID used to identify edits coming from this inline widget for undo batching */
    Inline3DParameterEditor.prototype._origin = null;


    /**
     * Returns the current text range of the parameters we're attached to, or null if
     * we've lost sync with what's in the code.
     * @return {?{start:{line:number, ch:number}, end:{line:number, ch:number}}}
     */
    Inline3DParameterEditor.prototype.getCurrentRange = function () {
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

        var line = this.hostEditor.document.getLine(start.line);

        /**
         * Returns an array of string that match the
         * given Regex
         * Eg : line = <a-cylinder position="-0.04 1.40 0.80"  rotation = "171.00 -0.10 "></a-cylinder>
         * matches = ["-0.04 1.18 0.80", "227", " 0.34", "171.00 -0.10 "]
         */
        var matches = line.substr(start.ch).match(Inline3dParametersUtils.PARAMETERS_3D_REGEX);

        // Note that end.ch is exclusive, so we don't need to add 1 before comparing to
        // the matched length here.
        if (matches && (end.ch === undefined || end.ch - start.ch < matches[0].length)) {
            matches[0] = matches[0].trim();
            end.ch = start.ch + matches[0].length;
            this._marker.clear();
            this._marker = this.hostEditor._codeMirror.markText(start, end);
        }

        if (end.ch === undefined) {
            // We were unable to resync the marker.
            return null;
        }
        return {start: start, end: end};
    };

    /**
     * When the selected text changes, update text in code editor
     * @param {!string} parameterString
     */
    Inline3DParameterEditor.prototype._handleParametersChange = function (parameterString) {
        var self = this;
        if (parameterString !== this._parameters) {
            var range = this.getCurrentRange();
            if (!range) {
                return;
            }

            // Don't push the change back into the host editor if it came from the host editor.
            if (!this._isHostChange) {
                var endPos = {
                    line: range.start.line,
                    ch: range.start.ch + parameterString.length
                };
                this._isOwnChange = true;
                this.hostEditor.document.batchOperation(function () {
                    self.hostEditor.setSelection(range.start, range.end); // workaround for #2805
                    self.hostEditor.document.replaceRange(parameterString, range.start, range.end, self._origin);
                    self.hostEditor.setSelection(range.start, endPos);
                    if (self._marker) {
                        self._marker.clear();
                        self._marker = self.hostEditor._codeMirror.markText(range.start, endPos);
                    }
                });
                this._isOwnChange = false;
            }

            this._parameters = parameterString;
        }
    };

    /**
     * @override
     * @param {!Editor} hostEditor
     */
    Inline3DParameterEditor.prototype.load = function (hostEditor) {
        Inline3DParameterEditor.prototype.parentClass.load.apply(this, arguments);
        this.parameterEditor = new ParameterEditor(this.$htmlContent, this._handleParametersChange, this._tag, this._parameters);
    };

    /**
     * @override
     * Perform sizing & focus once we've been added to Editor's DOM
     */
    Inline3DParameterEditor.prototype.onAdded = function () {
        Inline3DParameterEditor.prototype.parentClass.onAdded.apply(this, arguments);

        var doc = this.hostEditor.document;
        doc.addRef();
        doc.on("change", this._handleHostDocumentChange);

        this.hostEditor.setInlineWidgetHeight(this, this.parameterEditor.getRootElement().outerHeight(), true);

        this.parameterEditor.focus();
    };

    /**
     * @override
     * Called whenever the inline widget is closed, whether automatically or explicitly
     */
    Inline3DParameterEditor.prototype.onClosed = function () {
        Inline3DParameterEditor.prototype.parentClass.onClosed.apply(this, arguments);

        if (this._marker) {
            this._marker.clear();
        }

        var doc = this.hostEditor.document;
        doc.off("change", this._handleHostDocumentChange);
        doc.releaseRef();
    };

    Inline3DParameterEditor.prototype._handleHostDocumentChange = function () {
        if (this._isOwnChange) {
            return;
        }

        var range = this.getCurrentRange();
        if (range) {
            var parameters = this.hostEditor.document.getRange(range.start, range.end);
            if (parameters !== this._parameters) {
                if (this.parameterEditor.isValidSetOfParameters(parameters)) { // only update the editor if the parameters are valid
                    this._isHostChange = true;
                    this.parameterEditor.setParametersFromString(parameters);
                    this._isHostChange = false;
                }
            }
        } else {
            // The edit caused our range to become invalid. Close the editor.
            this.close();
        }
    };

    exports.Inline3DParameterEditor = Inline3DParameterEditor;
});
