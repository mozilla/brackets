define(function(require, exports, module) {
    "use strict";

    var BoxShadowInput = require("BoxShadowInput"),
        BoxShadowUtils = require("BoxShadowUtils");

    var units = BoxShadowUtils.UNITS;

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
    };

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
    };

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
    };

    exports.BoxShadowLength = BoxShadowLength;
});