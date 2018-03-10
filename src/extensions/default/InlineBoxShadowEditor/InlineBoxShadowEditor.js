define(function(require, exports, module) {
    "use strict";

    var InlineWidget         = brackets.getModule("editor/InlineWidget").InlineWidget,
        BoxShadowEditor      = require("BoxShadowEditor").BoxShadowEditor,
        ColorUtils           = brackets.getModule("utils/ColorUtils"),
        BoxShadowUtils       = require("BoxShadowUtils");

    /** @type {number} Global var used to provide a unique ID for each box-shadow editor instance's _origin field. */
    var lastOriginId = 1;

    /**
     * Inline widget containing a BoxShadowEditor control
     * The widget responds to changes in the text editor to the box-shadow string. Also, it is responsible for propagating changes 
     * from the box-shadow editor GUI to the text editor.
     * @param {!String} boxShadowString Initial box-shadow string.
     * @param {!CodeMirror.TextMarker} marker
     */
    function InlineBoxShadowEditor(boxShadowString, marker) {
        this._boxShadowString = boxShadowString;
        this._marker = marker;
        this._isOwnChange = false;
        this._isHostChange = false;
        this._origin = "+InlineBoxShadowEditor_" + (lastOriginId++);

        // this._orderOfValues = ["lengths", "color", "inset"]; require to match the user's written values
        this._values = {};
        this._extractValues();

        this._handleBoxShadowChange = this._handleBoxShadowChange.bind(this);
        this._handleHostDocumentChange = this._handleHostDocumentChange.bind(this);

        InlineWidget.call(this);
    }

    InlineBoxShadowEditor.prototype = Object.create(InlineWidget.prototype);
    InlineBoxShadowEditor.prototype.constructor = InlineBoxShadowEditor;
    InlineBoxShadowEditor.prototype.parentClass = InlineWidget.prototype;

    /** @type {!BoxShadowPicker} BoxShadowPicker instance */
    InlineBoxShadowEditor.prototype.BoxShadowEditor = null;

    /** @type {!String} Current value of the box-shadow editor control */
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

    InlineBoxShadowEditor.prototype._extractValues = function() {
        if(_isValidBoxShadowValue(this._boxShadowString) === false) {
            return;
        } 

        var values = this._boxShadowString.trim().split(" ");

        var lengthTypes, lengthTypesIter, lengthType;
        lengthTypes = BoxShadowUtils.LENGTH_TYPES;
        lengthTypesIter = 0;

        // Default case of box-shadows.
        this._values.inset = false;
        this._values.lengths = {};

        this._values = values.reduce(function(accumulator, currentValue, currentIndex) {
            currentValue = currentValue.trim();

            // Check for inset
            if(currentValue === "inset") {
                accumulator.inset = true;
            }
            // Check for color
            else if(currentValue.match(ColorUtils.COLOR_REGEX)) {
                accumulator.color = currentValue;
            }
            // Check for a length
            else if(currentValue.match(BoxShadowUtils.LENGTH_REGEX)) {
                if(lengthTypesIter < lengthTypes.length) {
                    lengthType = lengthTypes[lengthTypesIter++];
                    accumulator.lengths[lengthType] = currentValue;
                }
            }

            return accumulator;
        }, this._values);
    };

    InlineBoxShadowEditor.prototype._buildBoxShadowString = function () {
        var self = this;

        var lengthTypes, boxShadowArr, boxShadowString;
        lengthTypes = BoxShadowUtils.LENGTH_TYPES;

        boxShadowArr = lengthTypes.map(function(currentValue){
            return self._values.lengths[currentValue];
        });

        // Filter out undefined values.
        boxShadowArr = boxShadowArr.filter(function(currentValue) {
            return currentValue;
        });

        if(self._values.color) {
            boxShadowArr.push(self._values.color);
        }

        if(self._values.inset === true) {
            boxShadowArr.push("inset");
        }

        boxShadowString = boxShadowArr.join(" ");
        return boxShadowString;
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

        this._values = values;

        // build the box-shadow value as a string.
        var boxShadowString = this._buildBoxShadowString();

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
        var boxShadowRegex = new RegExp(BoxShadowUtils.BOX_SHADOW_REGEX);
        return boxShadowRegex.test(value);
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
            if(_isValidBoxShadowValue(newString)) {
                // extract values
                this._boxShadowString = newString;
                this._extractValues();
                this._isHostChange = true;
                this.boxShadowEditor.setValues(this._values);
                this._isHostChange = false;
            }

        }
        else {
            // The edit caused our range to become invalid. Close the editor.
            this.close();
        }
    };

    exports.InlineBoxShadowEditor = InlineBoxShadowEditor;
});