define(function (require, exports, module) {
    "use strict";

    var Strings            = brackets.getModule("strings"),
        Mustache           = brackets.getModule("thirdparty/mustache/mustache");

    /** Mustache template that forms the bare DOM structure of the UI */
    var Template = require("text!ParameterEditorTemplate.html");

     //used to control the smoothness of scroll.
     var MODIFIER = 10;

    function ParameterEditor($parent, callback) {
        // Create the DOM structure, filling in localized strings via Mustache
        this.$element = $(Mustache.render(Template, Strings));
        $parent.append(this.$element);

        this._callback = callback;

        this._handleXValueSliderDrag = this._handleXValueSliderDrag.bind(this);
        this.$xValueSlider = this.$element.find("#_x");
        this.$yValueSlider = this.$element.find("#_y");
        this.$zValueSlider = this.$element.find("#_z");
        this._x = parseFloat(this.$xValueSlider.val());
        this.$selectionBase = this.$element.find(".selector-base");

        // Attach event listeners to main UI elements
        this._addListeners();
    }


    /** Returns the root DOM node of the UI */
    ParameterEditor.prototype.getRootElement = function () {
        return this.$element;
    };

    ParameterEditor.prototype._addListeners = function () {
        var self = this;
        this.$xValueSlider.mousedown(function(e) {
            self._x = parseFloat(e.currentTarget.value);
            self._xPosition = e.clientX;
        });
        
        this.$xValueSlider.change(function(e) {
            self._commitParameters(self.$xValueSlider.val() + " 3 0");
        });

        this._registerDragHandler(this.$xValueSlider, this._handleXValueSliderDrag);
    };

    ParameterEditor.prototype.focus = function () {
        if (!this.$selectionBase.is(":focus")) {
            this.$selectionBase.focus();
            return true;
        }
        return false;
    };

    ParameterEditor.prototype._commitParameters = function (parameters) {
        this._callback(parameters);
    };

    ParameterEditor.prototype.setParametersFromString = function (parameters) {
        this.setSliderProperties(parameters);
        this._commitParameters(parameters, true);
    };

    ParameterEditor.prototype.isValidSetOfParameters = function (parameters) {
        var ParameterRegex = new RegExp(/((-)?\d+(\.\d+)?) ((-)?\d+(\.\d+)?) ((-)?\d+(\.\d+)?)/g);
        return ParameterRegex.test(parameters);
    };

    ParameterEditor.prototype.setSliderProperties = function (parameters) {
        var parametersArray = parameters.split(" ");
        this.$xValueSlider.val(parametersArray[0]);
        this.$yValueSlider.val(parametersArray[1]);
        this.$zValueSlider.val(parametersArray[2]);        
    };

    function _getNewOffset(pos, zeroPos) {
        var offset = pos - zeroPos;
        return offset/MODIFIER;
    };

    ParameterEditor.prototype._handleXValueSliderDrag = function(event) {
        var xPos = this._xPosition;
        var offset = _getNewOffset(event.clientX, xPos );
        var n = this._x + offset;
        this.$xValueSlider.val(n.toFixed(2));
        this._commitParameters(this.$xValueSlider.val() + " 3 0");
    };

    ParameterEditor.prototype._registerDragHandler = function ($element, handler) {
        var mouseupHandler = function (event) {
            $(window).unbind("mousemove", handler);
            $(window).unbind("mouseup", mouseupHandler);
        };
        $element.mousedown(function (event) {
            $(window).bind("mousemove", handler);
            $(window).bind("mouseup", mouseupHandler);
        });
        $element.mousedown(handler);
    };

    $(window.document).on("mousedown", function (e) {
        e.preventDefault();
    });

    exports.ParameterEditor = ParameterEditor;
});