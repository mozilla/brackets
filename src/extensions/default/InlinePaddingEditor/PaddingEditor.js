define(function(require, exports, module) {
    "use strict";

    var Strings            = brackets.getModule("strings");
    var Mustache           = brackets.getModule("thirdparty/mustache/mustache");
    var PaddingUtils       = require("PaddingUtils");
    var KeyEvent           = brackets.getModule("utils/KeyEvent");
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var StringUtils        = brackets.getModule("utils/StringUtils");
 
    // getting reference to the html template for the padding editor UI
    var PaddingTemplate = require("text!PaddingEditorTemplate.html");
    var check;

    function getIndividualValues(values){
        // Convert "12px 20px 30px" into an array of individual values like:
        // [{num: 12, unit: "px"}, {num: 20, unit: "px"}, ...]
        var individualValues = [];
        var currentValue;

        // We create a new regular expression everytime so that we don't
        // reuse stale data from the old RegExp object.
        var valueRegex = new RegExp(PaddingUtils.PADDING_SINGLE_VALUE_REGEX);

        while ((currentValue = valueRegex.exec(values)) !== null) {
            individualValues.push({
                num: parseFloat(currentValue[1]),
                unit: currentValue[2] || ""
            });
        }

        return individualValues;
    }

    function PaddingValue($parentElement, location, value, unit, onChange) {
        var self = this;

        self.value = value || 0;
        self.unit = unit || "";

        var $slider = this.$slider = $parentElement.find("#" + location + "-slider");
        var $unitOptions = $parentElement.find("#" + location + "-radio").children();
        var $text = $parentElement.find("#" + location + "-text");

        $slider.val(self.value);
        $unitOptions.filter(function() {
            return $(this).text().trim() === self.unit;
        }).addClass("selected");
        $text.text(self.toString());

        $slider.on("input", function() {
            var newValue = $slider.val().trim();
            self.value = newValue;
            $text.text(self.toString());
            onChange();
        });

        $unitOptions.on("click", function() {
            var $selectedUnit = $(this);
            $selectedUnit.siblings().removeClass("selected");
            $selectedUnit.addClass("selected");

            self.unit = $selectedUnit.text().trim();
            $text.text(self.toString());
            onChange();
        });
    }

    PaddingValue.prototype.toString = function() {
        return this.value + (this.value === 0 ? "" : this.unit);
    };

    function PaddingEditor($parent, valueString, paddingChangeHandler) {
        var self = this;

        // Create the DOM structure, filling in localized strings via Mustache
        self.$element = $(Mustache.render(PaddingTemplate, Strings));
        $parent.append(self.$element);
        self.paddingChangeHandler = paddingChangeHandler;

        this.onChange = this.onChange.bind(this);
        self.updateValues(valueString);

        // Attach event listeners to toggle the corner mode UI elements
        var $individualSidesArea = self.$element.find("#individualSidesArea");
        var $individualSidesButton = self.$element.find("#individualSides");
        var $allSidesArea = self.$element.find("#allSidesArea");
        var $allSidesButton = self.$element.find("#allSides");

        function toggleSidesOption($showElement, $hideElement) {
            $showElement.show();
            $hideElement.hide();
            self.allSides = $showElement === $allSidesArea;
            check = $showElement === $allSidesArea;
            self.onChange();
        }

        $allSidesButton.on("click", function() {
            $allSidesButton.addClass("selected");
            $individualSidesButton.removeClass("selected");
            toggleSidesOption($allSidesArea, $individualSidesArea);
        });
        $individualSidesButton.on("click", function() {
            $allSidesButton.removeClass("selected");
            $individualSidesButton.addClass("selected");
            toggleSidesOption($individualSidesArea, $allSidesArea);
        });

        // initialize individual side editing to be disabled if allSides is set to true
        if(self.allSides){
            $allSidesButton.trigger("click");
        } else {
            $individualSidesButton.trigger("click");
        }
    }

    PaddingEditor.prototype.updateValues = function(valueString) {
        var values = getIndividualValues(valueString);
        var numOfValues = values.length;

        this.allSides = values.length === 1;

        var firstValue = values[0];
        var secondValue = firstValue;
        var thirdValue = firstValue;
        var fourthValue = firstValue;
        // If we have just one value all sides will be assigned the same value 
        // else if values.length != 1 then we have checked all the cases here
        if (!this.allSides) {
            secondValue = values[1];
          
            if (numOfValues === 2) {
                fourthValue = secondValue;
            } else {
                thirdValue = values[2];
          
                if (numOfValues === 3) {
                    fourthValue = secondValue;
                } else {
                    fourthValue = values[3];
                }            
            }
        }

        this.top = new PaddingValue(
            this.$element,
            "top",
            firstValue.num,
            firstValue.unit,
            this.onChange
        );
        this.right = new PaddingValue(
            this.$element,
            "right",
            secondValue.num,
            secondValue.unit,
            this.onChange
        );
        this.bottom = new PaddingValue(
            this.$element,
            "bottom",
            thirdValue.num,
            thirdValue.unit,
            this.onChange
        );
        this.left = new PaddingValue(
            this.$element,
            "left",
            fourthValue.num,
            fourthValue.unit,
            this.onChange
        );
        this.allsides = new PaddingValue(
            this.$element,
            "all-sides",
            firstValue.num,
            firstValue.unit,
            this.onChange
        );
        
        //correctly update the values in the UI.
        this.onChange();
    };

    PaddingEditor.prototype.onChange = function() {
        if (this.allSides) {  
            this.paddingChangeHandler(this.allsides.toString());
            return;
        }

        var top = this.top.toString();
        var right = this.right.toString();
        var bottom = this.bottom.toString();
        var left = this.left.toString();
       
        var PaddingString;
        PaddingString = [top, right, bottom, left].join(" ");

        this.paddingChangeHandler(PaddingString);
    };

    PaddingEditor.prototype.focus = function() {
        this.top.$slider.focus();
    };

    PaddingEditor.prototype.isValidPaddingString = function(string){
        var paddingValueRegEx = new RegExp(PaddingUtils.PADDING_VALUE_REGEX);
        return paddingValueRegEx.test(string);
    };

    exports.PaddingEditor = PaddingEditor;
});

