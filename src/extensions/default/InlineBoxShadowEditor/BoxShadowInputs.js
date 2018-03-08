define(function(require, exports, module) {
    "use strict";

    var BoxShadowUtils = require("BoxShadowUtils"),
        ColorUtils     = brackets.getModule("utils/ColorUtils"),
        tinycolor      = require("thirdparty/tinycolor-min");

    var units = BoxShadowUtils.UNITS;

    var DEFAULT_COLOR = "black";

    function BoxShadowInput($parent, name) {
        this.name = name;
        this.$parent = $parent;
        this.$el = $parent.find("#" + this.name);
        this.$input = this.$el.find("input");
    };

    /**
     * @Override
     * Method to handle input events.
     */
    BoxShadowInput.prototype.handleInput = function() {
    };

    /**
     * @Override
     * Sets the value to the input
     */
    BoxShadowInput.prototype.setValue = function(string) {
    };

    /**
     * Get value method
     * @Override
     */
    BoxShadowInput.prototype.getValue = function() {
    }

    /** 
     * Set focus to the input element
     */
    BoxShadowInput.prototype.focus = function() {
        this.$input.focus();
    };

    function BoxShadowLength(parentRef, $parent, name, value, callback) {
        BoxShadowInput.call(this, $parent, name);

        this.type = "lengths";
        this.$units = this.$el.find(".units-container li");
        this.$value = this.$el.find(".slider-value");
        this.num = 0;
        this.unit = "px";
        this._callback = callback.bind(parentRef);
        this._init(value);
    };

    BoxShadowLength.prototype = Object.create(BoxShadowInput.prototype);
    BoxShadowLength.prototype.constructor = BoxShadowLength;

    /**
     * Takes care of initialization stuff. !!Improve this comment.
     */
    BoxShadowLength.prototype._init = function(value) {
        this.setValue(value);
        this.bindEvents();
    };

    BoxShadowLength.prototype.bindEvents = function() {
        var self = this;
        self.$input.bind("input", function() {
            self.handleInput();
        });

        self.$units.bind("click", function() {
            self.handleUnitChange(this);
        });
    }

    /**
     * @Override
     * Method to handle input events.
     */
    BoxShadowLength.prototype.handleInput = function() {
        var value = this.$input.val().trim();
        this.num = value;
        this._updateView();
        this._callback(this.type, this.name, this.getValue());
    };

    BoxShadowLength.prototype.handleUnitChange = function(target) {
        this.$units.removeClass("selected");
        
        var newUnit = $(target).attr("class").split(" ")[0];
        $(target).addClass("selected");
        
        this.unit = newUnit;
        this._updateView();
        this._callback(this.type, this.name, this.getValue());
    };

    /**
     * @Override
     * Sets the value to the input
     */
    BoxShadowLength.prototype.setValue = function(value) {

        if(value) {
            var num, unit, matches, lengthRegex;
            lengthRegex = new RegExp(BoxShadowUtils.LENGTH_REGEX);
            matches = lengthRegex.exec(value);
            this.num = parseInt(matches[1]);
            this.unit = matches[2];
        }
        else {
            this.num = 0;
            this.unit = "px";
        }

        this._updateView();
    };

    /**
     * Get value method
     * @Override
     */
    BoxShadowLength.prototype.getValue = function() {
        var result;
        result = "".concat(this.num, this.unit);
        return result;
    }

    BoxShadowLength.prototype._updateView = function() {
        this.$input.val(this.num);

        this.$value.text(this.getValue());

        this.$units.removeClass("selected");

        var targetClass = this.unit;
        this.$units.each(function() {
            if($(this).hasClass(targetClass)) {
                $(this).addClass("selected");
            }
        });
    }

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

    exports.BoxShadowInput = BoxShadowInput;
    exports.BoxShadowLength = BoxShadowLength;
    exports.BoxShadowColor = BoxShadowColor;
});