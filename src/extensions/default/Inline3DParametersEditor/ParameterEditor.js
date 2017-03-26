define(function (require, exports, module) {
    "use strict";

    var Strings                 = brackets.getModule("strings"),
        Inline3dParametersUtils = brackets.getModule("utils/Parameters3DUtils"),
        Mustache                = brackets.getModule("thirdparty/mustache/mustache");

    /** Mustache template that forms the bare DOM structure of the UI */
    var Template = require("text!ParameterEditorTemplate.html");

    function ParameterEditor($parent, callback, tag, parameters) {
        // Create the DOM structure, filling in localized strings via Mustache
        this.$element = $(Mustache.render(Template, Strings));
        $parent.append(this.$element);
        this._callback = callback;
        this._modifier = Inline3dParametersUtils.getModifier(tag) || 10;

        this._handleSliderDrag = this._handleSliderDrag.bind(this);

        this.setSliderProperties(parameters);

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
        for(var i = 0; i<this._numberOfParameters; i++) {
            this.$sliders[i].bind("mousedown", {"index" : i, "self" : this}, this._mouseDownCallback);
            this._registerDragHandler(this.$sliders[i], this._handleSliderDrag, i);
        }
    };

    ParameterEditor.prototype._mouseDownCallback = function(event) {
        var index = event.data.index;
        var self = event.data.self;
        self._values[index] = parseFloat(event.currentTarget.value);
        self._position = event.clientX;
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
        var ParameterRegex = new RegExp(Inline3dParametersUtils.PARAMETERS_3D_REGEX);
        return ParameterRegex.test(parameters);
    };

    ParameterEditor.prototype._setSpaces = function (parameters) {
        this._spaces = [];
        this._spaces.push(parameters.search(/\S/));
        if(this._spaces[0] === -1) {
            this._spaces[0] = 0;
        }

        parameters = parameters.substr(this._spaces[0]);
        for (var i = 0; i<this._numberOfParameters - 1 ; i++) {
            parameters = parameters.substr(parameters.indexOf(" "));
            this._spaces.push(parameters.search(/\S/));
            parameters = parameters.substr(this._spaces[i+1]);
        }

        if(parameters.indexOf(" ") === -1) {
            this._spaces.push(0);
        } else {
            parameters = parameters.substr(parameters.indexOf(" "));
            parameters = parameters + "$";
            this._spaces.push(parameters.search(/\S/));
        }
    };

    ParameterEditor.prototype._hideInputs = function() {
        if(this._numberOfParameters<=2) {
            this.$element.find("#_z").css("display", "none");
            this.$element.find("#input-z").css("display", "none");
        }
        if(this._numberOfParameters === 1) {
            this.$element.find("#_y").css("display", "none");
            this.$element.find("#input-y").css("display", "none");
        }
    };

    ParameterEditor.prototype.setSliderProperties = function (parameters) {
        this.$sliders = [];
        this.$sliders.push(this.$element.find("#_x"));
        this.$sliders.push(this.$element.find("#_y"));
        this.$sliders.push(this.$element.find("#_z"));

        this._numberOfParameters = this._getNumberOfProperties(parameters);

        this._hideInputs();

        this._values = [];
        for(var i = 0; i<this._numberOfParameters; i++) {
            this._values.push(parseFloat(this.$sliders[i].val()));
        }

        var parametersArray = parameters.trim().match(/\S+/g);
        this._setSpaces(parameters);

        for(var i = 0; i<this._numberOfParameters; i++) {
            this.$sliders[i].val(parametersArray[i]);
        }
    };

    ParameterEditor.prototype._getNumberOfProperties = function(parameters) {
        var parametersArray = parameters.trim().match(/\S+/g);
        return parametersArray.length;
    };

    ParameterEditor.prototype._getNewOffset = function(pos, zeroPos) {
        var offset = pos - zeroPos;
        return offset / this._modifier;
    };

    ParameterEditor.prototype._handleSliderDrag = function(event) {
        var index = event.data.index;
        var xPos = this._position;
        var offset = this._getNewOffset(event.clientX, xPos);
        var n = this._values[index] + offset;
        this.$sliders[index].val(n.toFixed(2));
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
        for(var i = 0; i<this._numberOfParameters; i++) {
            parameters += this.$sliders[i].val();
            parameters += this._getWhiteSpaces(this._spaces[i+1]);
        }
        return parameters;
    };

    ParameterEditor.prototype._registerDragHandler = function ($element, handler, index) {
        var mouseupHandler = function (event) {
            $(window).unbind("mousemove", handler);
            $(window).unbind("mouseup", mouseupHandler);
        };
        $element.mousedown(function (event) {
            $(window).bind("mousemove", {"index" : index}, handler);
            $(window).bind("mouseup", mouseupHandler);
        });
        $element.mousedown({"index" : index}, handler);
    };

    $(window.document).on("mousedown", function (e) {
        e.preventDefault();
    });

    exports.ParameterEditor = ParameterEditor;
});
