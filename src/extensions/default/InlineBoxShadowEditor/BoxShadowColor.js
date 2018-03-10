define(function(require, exports, module) {
    "use strict";

    var BoxShadowInput = require("BoxShadowInput").BoxShadowInput,
        ColorUtils     = brackets.getModule("utils/ColorUtils"),
        tinycolor      = require("thirdparty/tinycolor-min");

    var DEFAULT_COLOR = "black";

    function BoxShadowColor(parentRef, $parent, name, value, callback) {
        BoxShadowInput.call(this, $parent, name);

        this.type = "color";
        this.color = DEFAULT_COLOR;
        this._callback = callback.bind(parentRef);
        this._init(value);
    };

    BoxShadowColor.prototype = Object.create(BoxShadowInput.prototype);
    BoxShadowColor.prototype.constructor = BoxShadowColor;

    BoxShadowColor.prototype._init = function(value) {
        this.setValue(value);
        this.bindEvents();
    };

    BoxShadowColor.prototype.setValue = function(value) {
        var color = this._normalizeColorString(value);
        this.color = color;

        this._updateView();
    };

    BoxShadowColor.prototype.bindEvents = function() {
        var self = this;

        this.$input.bind("input", function() {
            self._handleColorChange();
        });
    };

    BoxShadowColor.prototype._updateView = function() {
        this.$input.val(this.color);
    };

    /**
     * Normalize the given color string into the format used by tinycolor, by adding a space
     * after commas.
     * @param {string} color The color to be corrected if it looks like an RGB or HSL color.
     * @return {string} a normalized color string.
     */
    BoxShadowColor.prototype._normalizeColorString = function(color) {
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

    BoxShadowColor.prototype._handleColorChange = function() {
        var newColor    = $.trim(this.$input.val()),
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

        this.color = newColor;

        if (newColorOk) {
           this.$input.css("border", "initial");
           this._callback(this.type, this.name, this.color);
        }
        else {
            this.$input.css("border", "2px solid red");
        }
    };

    exports.BoxShadowColor = BoxShadowColor;
});