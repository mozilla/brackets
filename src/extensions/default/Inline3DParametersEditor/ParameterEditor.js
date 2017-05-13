/*
 * File based on InlineColorEditor/ColorEditor.jss
 */

 define(function (require, exports, module) {
    "use strict";

    var Strings                 = brackets.getModule("strings"),
        Mustache                = brackets.getModule("thirdparty/mustache/mustache"),
        Inline3dParametersUtils = require("Parameters3DUtils"),
        Parameters              = JSON.parse(require("text!Parameters.json"));

    /** Mustache template that forms the bare DOM structure of the UI */
    var Template = require("text!ParameterEditorTemplate.html");

    function ParameterEditor($parent, callback, tag, parameters) {
        // Create the DOM structure, filling in localized strings via Mustache
        this.$element = $(Mustache.render(Template, Strings));
        $parent.append(this.$element);
        this._callback = callback;
        this._tag = tag;
        this._modifier = Inline3dParametersUtils.getModifier(this._tag) || 10;

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

    /**Registers event listeners for sliders*/
    ParameterEditor.prototype._addListeners = function () {
        var mouseupHandler = function (event) {
            this.$sliders[i].unbind("mousedown", this._mouseDownCallback);
            this.$sliders[i].unbind("mouseup", mouseupHandler);
        };

        for(var i = 0; i < this._numberOfParameters; i++) {
            this.$sliders[i].bind("mousedown", {"index" : i, "self" : this}, this._mouseDownCallback);
            this.$sliders[i].bind("mouseup", mouseupHandler);
            this._registerDragHandler(this.$sliders[i], this._handleSliderDrag, i);
        }
        
        $(this.$element).on("mousedown", function (e) {
            e.preventDefault();
        });
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

    /**
     * Initialises the _spaces array to store number of spaces between parameters
     * Eg: parameters = "2   3  2", this._spaces = [3, 2]
     */
    ParameterEditor.prototype._setSpaces = function (parameters) {
        this._spaces = [];
        for (var i = 0; i < this._numberOfParameters - 1 ; i++) {
            parameters = parameters.substr(parameters.indexOf(" "));
            this._spaces.push(parameters.search(/\S/));
            parameters = parameters.substr(this._spaces[i]);
        }
    };

    /**
     * Initialises sliders for the ParameterEditor object based on number of parameters
     */
    ParameterEditor.prototype.setSliderProperties = function (parameters) {
        this.$sliders = [];

        this._numberOfParameters = this._getNumberOfProperties(parameters);

        this._addSliders();
        this._setLabels();

        this._values = [];
        for(var i = 0; i < this._numberOfParameters; i++) {
            this._values.push(parseFloat(this.$sliders[i].val()));
        }

        var parametersArray = parameters.trim().match(/\S+/g);
        this._setSpaces(parameters);

        for(var i = 0; i < this._numberOfParameters; i++) {
            this.$sliders[i].val(parametersArray[i]);
        }
    };

    /**
     * Adds html elements based on the number of parameters in the HTML object.
     */
    ParameterEditor.prototype._addSliders = function() {
        for(var i = 0; i < this._numberOfParameters; i++) {
            var span = $('<span />').attr('id', 'label-'+(i+1));
            var input = $('<input />').attr('id', 'input-'+(i+1)).attr('class', 'input-box').attr('type', 'text');
            this.$element.find("#vec3").append(span);
            this.$element.find("#vec3").append(input);
            this.$sliders.push(this.$element.find("#input-"+(i+1)));
        }
    };

    /**
     * Initialises the _spaces array to store number of spaces between parameters
     */
    ParameterEditor.prototype._setLabels = function() {
        var parameter = Parameters[this._tag];
        if(!parameter) {
            return;
        }
        var labels = parameter.labels;
        if(!labels) {
            return;
        }
        for(var i = 0; i < labels.length; i++) {
            this.$element.find("#label-"+(i+1)).html(labels[i] + " &rarr;");
        }
    };

    /*
     * Returns the number of parameters based on the parameters string
     * @param {parameters} String consisting of parameters
     * @return {Number}
     */
    ParameterEditor.prototype._getNumberOfProperties = function(parameters) {
        var parametersArray = parameters.trim().match(/\S+/g);
        return parametersArray.length;
    };

    /*
     * Returns a modified offset to smoothen the scroll on the basis of the
     * modifier of the ParameterEditor object.
     */
    ParameterEditor.prototype._getOffset = function(pos, zeroPos) {
        var offset = pos - zeroPos;
        return offset / this._modifier;
    };

    ParameterEditor.prototype._handleSliderDrag = function(event) {
        var index = event.data.index;
        var xPos = this._position;
        var offset = this._getOffset(event.clientX, xPos);
        var n = this._values[index] + offset;
        this.$sliders[index].val(n.toFixed(2));
        this._commitParameters(this._getParameters());
    };

    /*
     * Returns a string consisting of as many space characters as the
     * inptt parameter
     * @param {number} Number of spaces required
     * @return {String}
     */
    ParameterEditor.prototype._getWhiteSpaces = function(number) {
        var spaces = "";
        for(var i = 0 ; i < number; i++) {
            spaces += " ";
        }
        return spaces;
    };

    ParameterEditor.prototype._getParameters = function() {
        var parameters = "";
        for(var i = 0; i < this._numberOfParameters-1; i++) {
            parameters += this.$sliders[i].val();
            parameters += this._getWhiteSpaces(this._spaces[i]);
        }
        parameters += this.$sliders[i].val();
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

    exports.ParameterEditor = ParameterEditor;
});
