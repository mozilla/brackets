define(function(require, exports, module) {
    "use strict";

    var InlineWidget         = brackets.getModule("editor/InlineWidget").InlineWidget,
        BoxShadowEditor      = require("BoxShadowEditor").BoxShadowEditor,
        ColorUtils           = brackets.getModule("utils/ColorUtils"),
        boxShadowValueTypes  = JSON.parse(require("text!BoxShadowValueTypes.json")).boxShadowValueTypes;


    /** @type {number} Global var used to provide a unique ID for each box-shadow editor instance's _origin field. */
    var lastOriginId = 1;

    /**
     * Inline widget containing a BoxShadowEditor control
     * @param {!{horizontalOffset: Number, verticalOffset: Number, blurRadius: Number, spreadRadius: Number, color: string}} values  Initial set of box-shadow values.
     * @param {!CodeMirror.TextMarker} marker
     */
    function InlineBoxShadowEditor(values, marker) {
        this._values = values;
        this._marker = marker;
        this._isOwnChange = false;
        this._isHostChange = false;
        this._origin = "+InlineBoxShadowEditor_" + (lastOriginId++);

        this._handleBoxShadowChange = this._handleBoxShadowChange.bind(this);
        this._handleHostDocumentChange = this._handleHostDocumentChange.bind(this);

        InlineWidget.call(this);
    }

    InlineBoxShadowEditor.prototype = Object.create(InlineWidget.prototype);
    InlineBoxShadowEditor.prototype.constructor = InlineBoxShadowEditor;
    InlineBoxShadowEditor.prototype.parentClass = InlineWidget.prototype;

    /** @type {!BoxShadowPicker} BoxShadowPicker instance */
    InlineBoxShadowEditor.prototype.BoxShadowEditor = null;

    /** @type {!{ horizontalOffset: Number, verticalOffset: Number, blurRadius: Number, spreadRadius: Number, color: string }} Current value of the BoxShadow editor control */
    InlineBoxShadowEditor.prototype._values = null;

    /**
     * Range of code we're attached to; _marker.find() may by null if sync is lost.
     * @type {!CodeMirror.TextMarker}
     */
    InlineBoxShadowEditor.prototype._marker = null;

    /** @type {boolean} True while we're syncing a BoxShadow editor change into the code editor */
    InlineBoxShadowEditor.prototype._isOwnChange = null;

    /** @type {boolean} True while we're syncing a code editor change into the BoxShadow editor */
    InlineBoxShadowEditor.prototype._isHostChange = null;

    /** @type {number} ID used to identify edits coming from this inline widget for undo batching */
    InlineBoxShadowEditor.prototype._origin = null;

    /**
     * Returns the current text range of the box-shadow value we're attached to, or null if
     * we've lost sync with what's in the code.
     * @return {?{start:{line:number, ch:number}, end:{line:number, ch:number}}}
    */
    InlineBoxShadowEditor.prototype.getCurrentRange = function () {
        var pos, start, end, line;

        pos = this._marker && this._marker.find();

        start = pos && pos.from;
        if (!start) {
            return null;
        }

        end = pos.to;

        line = this.hostEditor.document.getLine(start.line);
        
        start.ch = line.indexOf(':') + 1;
        while(line[start.ch] === ' ') {
            start.ch++;
        }

        end.line = start.line;
        end.ch = line.indexOf(';');

        if(end.ch === -1) {
            end.ch = line.length;
            while(end.ch > start.ch && line[end.ch] !== ';') {
                end.ch--;
            }
        }

        if (end.ch === undefined) {
            // We were unable to resync the marker.
            return null;
        } 
        else {
            return {start: start, end: end};
        }
    };

    InlineBoxShadowEditor.prototype._buildBoxShadowString = function (values) {
        var boxShadowString = boxShadowValueTypes.reduce(function(result, boxShadowValueType) {
            if(!values[boxShadowValueType]) {
                return result;
            }
            if (!isNaN(values[boxShadowValueType]) ) {
                result += " " + values[boxShadowValueType] + "px";
            }
            else {
                result += " " + values[boxShadowValueType];
            }
            return result;
        },"");

        return boxShadowString.trim();
    };


    /**
     * When the BoxShadow editor's values change, update text in code editor
     * @param {!{horizontalOffset: Number, verticalOffset: Number, blurRadius: Number, spreadRadius: Number, color: string}} values  New set of box-shadow values.
     */
    InlineBoxShadowEditor.prototype._handleBoxShadowChange = function (values) {
        var self = this;
        var range = this.getCurrentRange();
        if (!range) {
            return;
        }

        // update values 
        for(var key in this._values) {
            if(this._values.hasOwnProperty(key)) {
                if(values[key] && values[key] !== this._values[key]) {
                    this._values[key] = values[key];
                }
            }
        }

        // build the box-shadow value as a string.
        var boxShadowString = this._buildBoxShadowString(this._values);
        console.log(boxShadowString);

        var endPos = {
            line: range.start.line,
            ch: range.start.ch + boxShadowString.length
        };
        this._isOwnChange = true;
        this.hostEditor.document.batchOperation(function () {
            // Replace old box-shadow in code with the editor's box-shadow values, and select it
            self.hostEditor.setSelection(range.start, range.end);
            self.hostEditor.document.replaceRange(boxShadowString, range.start, range.end, self._origin);
            self.hostEditor.setSelection(range.start, endPos);
            if (self._marker) {
                self._marker.clear();
                self._marker = self.hostEditor._codeMirror.markText(range.start, endPos);
            }
        });
        this._isOwnChange = false;
    };

    /**
    * @override
    * @param {!Editor} hostEditor
    */
    InlineBoxShadowEditor.prototype.load = function (hostEditor) {
        InlineBoxShadowEditor.prototype.parentClass.load.apply(this, arguments);

        // Create BoxShadow picker control
        this.boxShadowEditor = new BoxShadowEditor(this.$htmlContent, this._values, this._handleBoxShadowChange);
    };

    /**
    * @override
    * Perform sizing & focus once we've been added to Editor's DOM
    */
    InlineBoxShadowEditor.prototype.onAdded = function () {
        InlineBoxShadowEditor.prototype.parentClass.onAdded.apply(this, arguments);

        var doc = this.hostEditor.document;
        doc.addRef();
        doc.on("change", this._handleHostDocumentChange);

        this.hostEditor.setInlineWidgetHeight(this, this.boxShadowEditor.getRootElement().outerHeight(), true);

        this.boxShadowEditor.focus();
    };

    /**
    * @override
    * Called whenever the inline widget is closed, whether automatically or explicitly
    */
    InlineBoxShadowEditor.prototype.onClosed = function () {
        InlineBoxShadowEditor.prototype.parentClass.onClosed.apply(this, arguments);

        if (this._marker) {
            this._marker.clear();
        }

        var doc = this.hostEditor.document;
        doc.off("change", this._handleHostDocumentChange);
        doc.releaseRef();
        this.boxShadowEditor.destroy();
    };

    function _isValidBoxShadowValue(value) {
        // Need to improve this regex.
        return (value.match(/\s*(\d+px\s+){0,3}?\d+px(?:\s+|;|)(?:#?[a-z]{3,}\s*)?;?/) !== null);
    }

    /**
     * When text in the code editor changes, update quick edit to reflect it
     */
    InlineBoxShadowEditor.prototype._handleHostDocumentChange = function () {
        // Don't push the change into the box-shadow editor if it came from the box-shadow editor.
        if (this._isOwnChange) {
            return;
        }

        var range = this.getCurrentRange();
        if (range) {
            var newString = this.hostEditor.document.getRange(range.start, range.end);

            var flag = _isValidBoxShadowValue(newString);

            if(_isValidBoxShadowValue(newString)) {
                // extract values
                var newValues = {};
                var boxShadowValueIndex = 0;

                newString.split(/\s+/).forEach(function(value, index) {
                    value = value.trim();
                    var colorMatch = value.match(ColorUtils.COLOR_REGEX);
                    var pixelMatch = value.match(/(\d+)px/);
                    console.log(colorMatch);
                    if(colorMatch) {
                        newValues["color"] = colorMatch[0];
                    }
                    else if(pixelMatch){
                        newValues[boxShadowValueTypes[boxShadowValueIndex++]] = value;
                    }
                });
                console.log(newValues);

                if(newValues !== this._values) {
                    this._isHostChange = true;
                    this.boxShadowEditor.setValues(newValues);
                    this._values = newValues;
                    this._isHostChange = false;
                }
            }

        }
        else {
            // The edit caused our range to become invalid. Close the editor.
            this.close();
        }
    };

    exports.InlineBoxShadowEditor = InlineBoxShadowEditor;
});