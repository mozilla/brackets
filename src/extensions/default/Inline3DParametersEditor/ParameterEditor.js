define(function (require, exports, module) {
    "use strict";

    var Strings                 = brackets.getModule("strings"),
        Inline3dParametersUtils = brackets.getModule("utils/Parameters3DUtils"),
        Mustache                = brackets.getModule("thirdparty/mustache/mustache");

    /** Mustache template that forms the bare DOM structure of the UI */
    var Template = require("text!ParameterEditorTemplate.html");

    function ParameterEditor($parent, callback, tag) {
        // Create the DOM structure, filling in localized strings via Mustache
        this.$element = $(Mustache.render(Template, Strings));
        $parent.append(this.$element);
        this._callback = callback;
        this._modifier = Inline3dParametersUtils.getModifier(tag);

        this._handleXValueSliderDrag = this._handleXValueSliderDrag.bind(this);
        this._handleYValueSliderDrag = this._handleYValueSliderDrag.bind(this);
        this._handleZValueSliderDrag = this._handleZValueSliderDrag.bind(this);

        this.$xValueSlider = this.$element.find("#_x");
        this.$yValueSlider = this.$element.find("#_y");
        this.$zValueSlider = this.$element.find("#_z");

        this._x = parseFloat(this.$xValueSlider.val());
        this._y = parseFloat(this.$yValueSlider.val());
        this._z = parseFloat(this.$zValueSlider.val());

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
            self._position = e.clientX;
        });

        this.$yValueSlider.mousedown(function(e) {
            self._y = parseFloat(e.currentTarget.value);
            self._position = e.clientX;
        });

        this.$zValueSlider.mousedown(function(e) {
            self._z = parseFloat(e.currentTarget.value);
            self._position = e.clientX;
        });

        
        this.$xValueSlider.change(function(e) {
            self._commitParameters(self.$xValueSlider.val() + self.$yValueSlider.val() + self.$zValueSlider.val());
        });

        this._registerDragHandler(this.$xValueSlider, this._handleXValueSliderDrag);
        this._registerDragHandler(this.$yValueSlider, this._handleYValueSliderDrag);
        this._registerDragHandler(this.$zValueSlider, this._handleZValueSliderDrag);

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
        var parametersArray = parameters.trim().match(/\S+/g);
        this._spaces = [];

        this._spaces.push(parameters.search(/\S/));
        if(this._spaces[0] === -1) {
            this._spaces[0] = 0;
        }
        parameters = parameters.substr(this._spaces[0]);
        parameters = parameters.substr(parameters.indexOf(" "));

        this._spaces.push(parameters.search(/\S/));
        parameters = parameters.substr(this._spaces[1]);
        parameters = parameters.substr(parameters.indexOf(" "));

        this._spaces.push(parameters.search(/\S/));
        parameters = parameters.substr(this._spaces[2]);
        if(parameters.indexOf(" ") === -1) {
            this._spaces.push(0);
        } else {
            parameters = parameters.substr(parameters.indexOf(" "));
            parameters = parameters + "$";
            this._spaces.push(parameters.search(/\S/));
        }

        this.$xValueSlider.val(parametersArray[0]);
        this.$yValueSlider.val(parametersArray[1]);
        this.$zValueSlider.val(parametersArray[2]);        
    };

    ParameterEditor.prototype._getNewOffset = function(pos, zeroPos) {
        var offset = pos - zeroPos;
        return offset / this._modifier;
    };

    ParameterEditor.prototype._handleXValueSliderDrag = function(event) {
        var xPos = this._position;
        var offset = this._getNewOffset(event.clientX, xPos);
        var n = this._x + offset;
        this.$xValueSlider.val(n.toFixed(2));
        this._commitParameters(this._getParameters());
    };

    ParameterEditor.prototype._handleYValueSliderDrag = function(event) {
        var yPos = this._position;
        var offset = this._getNewOffset(event.clientX, yPos);
        var n = this._y + offset;
        this.$yValueSlider.val(n.toFixed(2));
        this._commitParameters(this._getParameters());
    };

    ParameterEditor.prototype._handleZValueSliderDrag = function(event) {
        var zPos = this._position;
        var offset = this._getNewOffset(event.clientX, zPos);
        var n = this._z + offset;
        this.$zValueSlider.val(n.toFixed(2));
        this._commitParameters(this._getParameters());
    };

    ParameterEditor.prototype._getWhiteSpaces = function(number) {
        var spaces = "";
        for(var i = 0 ; i<number; i++) {
            spaces += " ";
        }
        return spaces;
    };

    ParameterEditor.prototype._getParameters = function() {
        var parameters = this._getWhiteSpaces(this._spaces[0]);
        parameters += this.$xValueSlider.val();
        parameters += this._getWhiteSpaces(this._spaces[1]);
        parameters += this.$yValueSlider.val();
        parameters += this._getWhiteSpaces(this._spaces[2]);
        parameters += this.$zValueSlider.val();
        parameters += this._getWhiteSpaces(this._spaces[3]);
        return parameters;
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
