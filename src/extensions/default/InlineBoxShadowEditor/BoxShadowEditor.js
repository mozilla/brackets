define(function(require, exports, module) {
    "use strict";

    var KeyEvent           = brackets.getModule("utils/KeyEvent"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        StringUtils        = brackets.getModule("utils/StringUtils"),
        Strings            = brackets.getModule("strings"),
        Mustache           = brackets.getModule("thirdparty/mustache/mustache"),
        tinycolor          = require("thirdparty/tinycolor-min");

    /** Mustache template that forms the bare DOM structure of the UI */
    var BoxShadowEditorTemplate = require("text!BoxShadowEditorTemplate.html");

    /**
     * Box shadow editor control; may be used standalone or within an InlineBoxShadowEditor inline widget.
     * @param {!jQuery} $parent  DOM node into which to append the root of the box-shadow editor UI
     * @param {!{horizontalOffset: string, verticalOffset: string, blurRadius: string, spreadRadius: string, color: string}} values  Initial set of box-shadow values.
     * @param {!function(string)} callback  Called whenever values change
     */
    function BoxShadowEditor($parent, values, callback) {
        // Create the DOM structure, filling in localized strings via Mustache
        this.$element = $(Mustache.render(BoxShadowEditorTemplate, Strings));
        $parent.append(this.$element);

        this._callback = callback;

        this._values = values;
        this._originalValues = values;
        this._redoValues = null;

        // Get references
        this.$horizontalOffsetValue = this.$element.find("#horizontal-offset-value");
        this.$verticalOffsetValue = this.$element.find("#vertical-offset-value");
        this.$blurRadiusValue = this.$element.find("#blur-radius-value");
        this.$spreadRadiusValue = this.$element.find("#spread-radius-value");
        this.$colorValue = this.$element.find("#color-value");


        // Attach event listeners to main UI elements
        this._bindInputHandlers();


        // Set initial values in the box-shadow editor inputs.
        this._setInputValues();
    }

    /**
     * A string or tinycolor object representing the currently selected color
     * TODO (#2201): type is unpredictable
     * @type {tinycolor|string}
     */
    BoxShadowEditor.prototype._values = null;

    /**
     * box shadow values that was selected before undo(), if undo was the last change made. Else null.
     * @type {?string}
     */
    BoxShadowEditor.prototype._redoValues = null;

    /**
     * Initial value the BoxShadow picker was opened with
     * @type {!string}
     */
    BoxShadowEditor.prototype._originalValues = null;


    /** Returns the root DOM node of the BoxShadowPicker UI */
    BoxShadowEditor.prototype.getRootElement = function () {
        return this.$element;
    };

    BoxShadowEditor.prototype.setValues = function(values) {
        for(var key in this._values) {
            if(this._values.hasOwnProperty(key)) {
                if(values[key] && values[key] !== this._values[key]) {
                    this._values[key] = values[key];
                }
            }
        }
        
        this._setInputValues();
    };

    BoxShadowEditor.prototype._setInputValues = function() {
        var values = this._values;
        var horizontalOffset, verticalOffset, blurRadius, spreadRadius, color;

        horizontalOffset = values["horizontalOffset"] ? parseFloat(values["horizontalOffset"]) : ""; 
        verticalOffset = values["verticalOffset"] ? parseFloat(values["verticalOffset"]) : ""; 
        blurRadius = values["blurRadius"] ? parseFloat(values["blurRadius"]) : ""; 
        spreadRadius = values["spreadRadius"] ? parseFloat(values["spreadRadius"]) : ""; 
        color = values["color"] ? values["color"] : "";

        this.$horizontalOffsetValue.val(horizontalOffset);
        this.$verticalOffsetValue.val(verticalOffset);
        this.$blurRadiusValue.val(blurRadius);
        this.$spreadRadiusValue.val(spreadRadius);
        this.$colorValue.val(color);
    };

    BoxShadowEditor.prototype._bindInputHandlers = function() {
        var self = this;

        this.$horizontalOffsetValue.bind("input", function (event) {
            self._handleHorizontalOffsetChange();
        });

        this.$verticalOffsetValue.bind("input", function (event) {
            self._handleVerticalOffsetChange();
        });

        this.$blurRadiusValue.bind("input", function (event) {
            self._handleBlurRadiusChange();
        });

        this.$spreadRadiusValue.bind("input", function (event) {
            self._handleSpreadRadiusChange();
        });

        this.$colorValue.bind("input", function (event) {
            self._handleColorChange();
        });
    };

    BoxShadowEditor.prototype.focus = function() {
        this.$horizontalOffsetValue.focus();
    };

    BoxShadowEditor.prototype.destroy = function() {
    };

    BoxShadowEditor.prototype.getValues = function() {
        return this._values;
    };

    // Utilty function to check if data is of correct format.
    function _isValidNumber(data) {
        return (data.match(/\-?\d*/) !== null);
    };

    function _handleChanges($inputElement, propertyName, value) {
        console.log(value, typeof value);
        if(!_isValidNumber(value)) {
            if(!this._values[propertyName]) {
                $inputElement.val("");
                return;
            }
            var curValue = parseFloat(this._values[propertyName]);
            $inputElement.val(curValue);
        }

        if(value === "") {
            // This is to maintain the box-shadow property.
            value = "0";
            $inputElement.val(value);
        }

        var newValue = value + "px";
        this._commitChanges(propertyName, newValue);
    };

    BoxShadowEditor.prototype._handleHorizontalOffsetChange = function() {
        var self = this;
        var newValue = this.$horizontalOffsetValue.val().trim();
        _handleChanges.call(self, this.$horizontalOffsetValue, "horizontalOffset", newValue);
    };

    BoxShadowEditor.prototype._handleVerticalOffsetChange = function() {
        var self = this;
        var newValue = this.$verticalOffsetValue.val().trim();
        _handleChanges.call(self, this.$verticalOffsetValue, "verticalOffset", newValue);
    };

    BoxShadowEditor.prototype._handleBlurRadiusChange = function() {
        var self = this;
        var newValue = this.$blurRadiusValue.val().trim();
        _handleChanges.call(self, this.$blurRadiusValue, "blurRadius", newValue);
    };

    BoxShadowEditor.prototype._handleSpreadRadiusChange = function() {
        var self = this;
        var newValue = this.$spreadRadiusValue.val().trim();
        _handleChanges.call(self, this.$spreadRadiusValue, "spreadRadius", newValue);
    };

    /**
     * Normalize the given color string into the format used by tinycolor, by adding a space
     * after commas.
     * @param {string} color The color to be corrected if it looks like an RGB or HSL color.
     * @return {string} a normalized color string.
     */
    BoxShadowEditor.prototype._normalizeColorString = function (color) {
        var normalizedColor = color;

        // Convert 6-digit hex to 3-digit hex as TinyColor (#ffaacc -> #fac)
        if (color.match(/^#[0-9a-fA-F]{6}/)) {
            return tinycolor(color).toString();
        }
        if (color.match(/^(rgb|hsl)/i)) {
            normalizedColor = normalizedColor.replace(/,\s*/g, ", ");
            normalizedColor = normalizedColor.replace(/\(\s+/, "(");
            normalizedColor = normalizedColor.replace(/\s+\)/, ")");
        }
        return normalizedColor;
    };

    BoxShadowEditor.prototype._handleColorChange = function() {
        var newColor    = $.trim(this.$colorValue.val()),
            newColorObj = tinycolor(newColor),
            newColorOk  = newColorObj.isValid();

        // TinyColor will auto correct an incomplete rgb or hsl value into a valid color value.
        // eg. rgb(0,0,0 -> rgb(0, 0, 0)
        // We want to avoid having TinyColor do this, because we don't want to sync the color
        // to the UI if it's incomplete. To accomplish this, we first normalize the original
        // color string into the format TinyColor would generate, and then compare it to what
        // TinyColor actually generates to see if it's different. If so, then we assume the color
        // was incomplete to begin with.
        if (newColorOk) {
            newColorOk = (newColorObj.toString() === this._normalizeColorString(newColor));
        }

        // Sync only if we have a valid color or we're restoring the previous valid color.
        if (newColorOk) {
           console.log(newColor);
            this._commitChanges("color", newColor);
        }
    };

    BoxShadowEditor.prototype._undo = function() {
        
    };

    BoxShadowEditor.prototype._redo = function() {
        
    };

    /**
    * Global handler for keys in the color editor. Catches undo/redo keys and traps
    * arrow keys that would be handled by the scroller.
    */
    BoxShadowEditor.prototype._handleKeydown = function (event) {
        var hasCtrl = (brackets.platform === "win") ? (event.ctrlKey) : (event.metaKey);
        if (hasCtrl) {
            switch (event.keyCode) {
                case KeyEvent.DOM_VK_Z:
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    return false;
                case KeyEvent.DOM_VK_Y:
                    this.redo();
                    return false;
            }
        }
    };


    BoxShadowEditor.prototype._commitChanges = function(propertyName, value) {
        this._values[propertyName] = value;
        this._callback(this._values);
    };


    exports.BoxShadowEditor = BoxShadowEditor;
});