define(function(require, exports, module) {
    "use strict";

    var Strings = brackets.getModule("strings");
    var Mustache = brackets.getModule("thirdparty/mustache/mustache");
    var BorderRadiusUtils = require("BorderRadiusUtils");

    // getting reference to the html template for the border-radius editor UI
    var BorderRadiusTemplate = require("text!BorderRadiusEditorTemplate.html");

    function getIndividualValues(values){
        // Convert "12px 20px 30px" into an array of individual values like:
        // [{num: 12, unit: "px"}, {num: 20, unit: "px"}, ...]
        var individualValues = [];
        var currentValue;

        // We create a new regular expression everytime so that we don't
        // reuse stale data from the old RegExp object.
        var valueRegex = new RegExp(BorderRadiusUtils.BORDER_RADIUS_SINGLE_VALUE_REGEX);

        while ((currentValue = valueRegex.exec(values)) !== null) {
            individualValues.push({
                num: parseFloat(currentValue[1]),
                unit: currentValue[2] || ""
            });
        }

        return individualValues;
    }

    function BorderRadiusValue($parentElement, location, value, unit, onChange) {
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

    BorderRadiusValue.prototype.toString = function() {
        return this.value + (this.value === 0 ? "" : this.unit);
    };

    function BorderRadiusEditor($parent, valueString, radiusChangeHandler, iconClassName, isSingleProperty) {
        var self = this;
        var values = JSON.parse(JSON.stringify(Strings));

        if (!isSingleProperty) {
            values["inlineEditorHeader"] = true;
            values["individualCornerArea"] = true;
            values["allCornerArea"] = true;
        } else {
            values["singleCornerArea"] = true;
        }

        // Create the DOM structure, filling in localized strings via Mustache
        values["iconClassName"] = iconClassName;
        self.$element = $(Mustache.render(BorderRadiusTemplate, values));

        $parent.append(self.$element);
        self.radiusChangeHandler = radiusChangeHandler;

        this.onChange = this.onChange.bind(this);
        self.updateValues(valueString);

        // Attach event listeners to toggle the corner mode UI elements
        var $individualCornerArea = self.$element.find("#individualCornerArea");
        var $individualCornerButton = self.$element.find("#individualCorners");
        var $allCornersArea = self.$element.find("#allCornersArea");
        var $allCornerButton = self.$element.find("#allCorners");

        function toggleCornerOption($showElement, $hideElement) {
            $showElement.show();
            $hideElement.hide();
            self.allCorners = $showElement === $allCornersArea;
            self.onChange();
        }

        $allCornerButton.on("click", function() {
            $allCornerButton.addClass("selected");
            $individualCornerButton.removeClass("selected");
            toggleCornerOption($allCornersArea, $individualCornerArea);
        });
        $individualCornerButton.on("click", function() {
            $allCornerButton.removeClass("selected");
            $individualCornerButton.addClass("selected");
            toggleCornerOption($individualCornerArea, $allCornersArea);
        });

        // initialize individual corner editing to be disabled if allCorner is set to true
        if(self.allCorners){
            $allCornerButton.trigger("click");
        } else {
            $individualCornerButton.trigger("click");
        }
    }

    BorderRadiusEditor.prototype.updateValues = function(valueString) {
        var values = getIndividualValues(valueString);
        var numOfValues = values.length;
        var firstValue = values[0];
        var secondValue = firstValue;
        var thirdValue = firstValue;
        var fourthValue = firstValue;

        this.allCorners = values.length === 1;

        if (!this.allCorners) {
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

        this.topLeft = new BorderRadiusValue(
            this.$element,
            "top-left",
            firstValue.num,
            firstValue.unit,
            this.onChange
        );
        this.topRight = new BorderRadiusValue(
            this.$element,
            "top-right",
            secondValue.num,
            secondValue.unit,
            this.onChange
        );
        this.bottomRight = new BorderRadiusValue(
            this.$element,
            "bottom-right",
            thirdValue.num,
            thirdValue.unit,
            this.onChange
        );
        this.bottomLeft = new BorderRadiusValue(
            this.$element,
            "bottom-left",
            fourthValue.num,
            fourthValue.unit,
            this.onChange
        );
        this.allCorner = new BorderRadiusValue(
            this.$element,
            "all-corner",
            firstValue.num,
            firstValue.unit,
            this.onChange
        );
        
        //correctly update the values in the UI.
        this.onChange();
    };

    BorderRadiusEditor.prototype.onChange = function() {
        if (this.allCorners) {
            this.radiusChangeHandler(this.allCorner.toString());
            return;
        }

        var topLeft = this.topLeft.toString();
        var topRight = this.topRight.toString();
        var bottomRight = this.bottomRight.toString();
        var bottomLeft = this.bottomLeft.toString();
        var borderRadiusString;

        if (topRight === bottomLeft) {
            // We can use a two value border radius if top right and
            // bottom left are equal and top left and bottom right are equal.
            // For e.g. 20px 30px
            borderRadiusString = topLeft + " " + topRight;

            if (topLeft !== bottomRight) {
                // We can use a three value border radius if top right and
                // bottom left are equal but the top left and bottom right
                // values are not.
                borderRadiusString += " " + bottomRight;
            } else if (topLeft === topRight) {
                // This means that top left and bottom right are equal (set 1),
                // the top right and bottom left values are equal (set 2), and
                // that set 1 and set 2 are equal - implying that all values
                // are the same.
                borderRadiusString = topLeft;
            }
        } else {
            borderRadiusString = [topLeft, topRight, bottomRight, bottomLeft].join(" ");
        }

        this.radiusChangeHandler(borderRadiusString);
    };

    BorderRadiusEditor.prototype.focus = function() {
        this.topLeft.$slider.focus();
    };

    BorderRadiusEditor.prototype.isValidBorderRadiusString = function(string){
        var radiusValueRegEx = new RegExp(BorderRadiusUtils.BORDER_RADIUS_VALUE_REGEX);
        return radiusValueRegEx.test(string);
    };

    exports.BorderRadiusEditor = BorderRadiusEditor;
});
