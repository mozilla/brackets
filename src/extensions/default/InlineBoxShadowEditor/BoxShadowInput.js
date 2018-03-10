define(function(require, exports, module) {
    "use strict";

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
    };

    /** 
     * Set focus to the input element
     */
    BoxShadowInput.prototype.focus = function() {
        this.$input.focus();
    };

    exports.BoxShadowInput = BoxShadowInput;
});