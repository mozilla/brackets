define(function(require, exports, module) {
    "use strict";

    var BoxShadowInput = require("BoxShadowInput").BoxShadowInput,
        BoxShadowUtils = require("BoxShadowUtils");

    var units = BoxShadowUtils.UNITS;

    function BoxShadowInset(parentRef, $parent, name, value, callback) {
        BoxShadowInput.call(this, $parent, name);

        this.type = "inset";
        this.value = false;

        this._callback = callback.bind(parentRef);
        this._init(value);
    };

    BoxShadowInset.prototype = Object.create(BoxShadowInput.prototype);
    BoxShadowInset.prototype.constructor = BoxShadowInset;

    /**
     * Takes care of initialization stuff. !!Improve this comment.
     */
    BoxShadowInset.prototype._init = function(value) {
        this.setValue(value);
        this.bindEvents();
    };

    BoxShadowInset.prototype.bindEvents = function() {
        var self = this;
        self.$input.bind("change", function() {
            self.handleInput();
        });
    };

    /**

     * @Override
     * Method to handle input events.
     */
    BoxShadowInset.prototype.handleInput = function(value) {
        if(this.$input.is(":checked") === true) {
            this.value = true;
        }
        else {
            this.value = false;
        }
        this._callback(this.type, this.name, this.getValue());
    };

    /**
     * @Override
     * Sets the value to the input
     */
    BoxShadowInset.prototype.setValue = function(value) {
        this.value = value;
        this._updateView();
    };

    /**
     * Get value method
     * @Override
     */
    BoxShadowInset.prototype.getValue = function() {
        return this.value;
    };

    BoxShadowInset.prototype._updateView = function() {
        this.$input.prop("checked", this.value);
    };

    exports.BoxShadowInset = BoxShadowInset;
});