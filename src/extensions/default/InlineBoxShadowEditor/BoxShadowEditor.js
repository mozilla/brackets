define(function(require, exports, module) {
    "use strict";

    var KeyEvent           = brackets.getModule("utils/KeyEvent"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        StringUtils        = brackets.getModule("utils/StringUtils"),
        Strings            = brackets.getModule("strings"),
        Mustache           = brackets.getModule("thirdparty/mustache/mustache"),
        BoxShadowLength    = require("BoxShadowLength"),
        BoxShadowColor     = require("BoxShadowColor"),
        BoxShadowUtils     = require("BoxShadowUtils");

    /** Mustache template that forms the bare DOM structure of the UI */
    var BoxShadowEditorTemplate = require("text!BoxShadowEditorTemplate.html");

    /**
     * Box shadow editor control; may be used standalone or within an InlineBoxShadowEditor inline widget.
     * @param {!jQuery} $parent  DOM node into which to append the root of the box-shadow editor UI
     * @param {!{h-shadow: string, v-shadow: string, blur: string, spread: string, color: string}} values  Initial set of box-shadow values.
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
        this._initializeInputs(values);
    }

    /**
     * A object representing the current set of box-shadow values
     * @type {}
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
        this.hShadow.setValue(values.lengths["h-shadow"]);
        this.vShadow.setValue(values.lengths["v-shadow"]);
        this.blur.setValue(values.lengths["blur"]);
        this.spread.setValue(values.lengths["spread"]);
        this.color.setValue(values["color"]);
    };

    BoxShadowEditor.prototype._initializeInputs =  function(values) {
        this.hShadow = new BoxShadowLength(this, this.$element, "h-shadow", values.lengths["h-shadow"], this.handleChanges);

        this.vShadow = new BoxShadowLength(this, this.$element, "v-shadow", values.lengths["v-shadow"], this.handleChanges);

        this.blur = new BoxShadowLength(this, this.$element, "blur", values.lengths["blur"], this.handleChanges);

        this.spread = new BoxShadowLength(this, this.$element, "spread", values.lengths["spread"], this.handleChanges);

        this.color = new BoxShadowColor(this, this.$element, "color", values["color"], this.handleChanges);
        // this.$inset = this.$element.find("#inset");
    };

    BoxShadowEditor.prototype.focus = function() {
        this.hShadow.focus();
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

    BoxShadowEditor.prototype.handleChanges = function(type, name, value) {
        if(type === "lengths") {
            this._values.lengths[name] = value;
        }
        else if(type === "color") {
            this._values[name] = value;
        }
        else if(type === "inset") {
            this._values[name] = value;
        }

        this._callback(this._values);
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

    exports.BoxShadowEditor = BoxShadowEditor;
});