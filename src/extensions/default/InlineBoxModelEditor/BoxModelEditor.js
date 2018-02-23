define(function(require, exports, module) {
    "use strict";

    var Strings            = brackets.getModule("strings");
    var Mustache           = brackets.getModule("thirdparty/mustache/mustache");
    var BoxModelUtils      = require("BoxModelUtils");
    var KeyEvent           = brackets.getModule("utils/KeyEvent");
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var StringUtils        = brackets.getModule("utils/StringUtils");
 
    // getting reference to the html template for the BoxModel editor UI
    var BoxModelTemplate   = require("text!BoxModelEditorTemplate.html");
    var check;

    function getIndividualValues(values){
        // Convert "12px 20px 30px" into an array of individual values like:
        // [{num: 12, unit: "px"}, {num: 20, unit: "px"}, ...]
        var individualValues = [];
        var currentValue;

        // We create a new regular expression everytime so that we don't
        // reuse stale data from the old RegExp object.
        var valueRegex = new RegExp(BoxModelUtils.BOXMODEL_SINGLE_VALUE_REGEX);

        while ((currentValue = valueRegex.exec(values)) !== null) {
            individualValues.push({
                num: parseFloat(currentValue[1]),
                unit: currentValue[2] || ""
            });
        }

        return individualValues;
    }

    function BoxModelValue($parentElement, location, value, unit, onChange) {
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

    BoxModelValue.prototype.toString = function() {
        return this.value + (this.value === 0 ? "" : this.unit);
    };

    function BoxModelEditor($parent, valueString, BoxModelChangeHandler, type, iconClassName) {
        var self = this;

        var headerKey = "";

        switch (type) {
            case BoxModelUtils.PADDING:
                headerKey = "SET_PADDING_FOR";
                break;
            case BoxModelUtils.MARGIN:
                headerKey = "SET_MARGIN_FOR";
                break;
        }

        Strings["BOX_MODEL_HEADER"] = Strings[headerKey];
        Strings["box-model-icon-class-name"] = iconClassName;
        // Create the DOM structure, filling in localized strings via Mustache
        self.$element = $(Mustache.render(BoxModelTemplate, Strings));

        $parent.append(self.$element);
        self.BoxModelChangeHandler = BoxModelChangeHandler;

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

    BoxModelEditor.prototype.updateValues = function(valueString) {
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

        this.top = new BoxModelValue(
            this.$element,
            "top",
            firstValue.num,
            firstValue.unit,
            this.onChange
        );
        this.right = new BoxModelValue(
            this.$element,
            "right",
            secondValue.num,
            secondValue.unit,
            this.onChange
        );
        this.bottom = new BoxModelValue(
            this.$element,
            "bottom",
            thirdValue.num,
            thirdValue.unit,
            this.onChange
        );
        this.left = new BoxModelValue(
            this.$element,
            "left",
            fourthValue.num,
            fourthValue.unit,
            this.onChange
        );
        this.allsides = new BoxModelValue(
            this.$element,
            "all-sides",
            firstValue.num,
            firstValue.unit,
            this.onChange
        );
        
        //correctly update the values in the UI.
        this.onChange();
    };

    BoxModelEditor.prototype.onChange = function() {
        if (this.allSides) {  
            this.BoxModelChangeHandler(this.allsides.toString());
            return;
        }

        var top = this.top.toString();
        var right = this.right.toString();
        var bottom = this.bottom.toString();
        var left = this.left.toString();
       
        var BoxModelString;
        BoxModelString = [top, right, bottom, left].join(" ");

        this.BoxModelChangeHandler(BoxModelString);
    };

    BoxModelEditor.prototype.focus = function() {
        this.top.$slider.focus();
    };

    BoxModelEditor.prototype.isValidBoxModelString = function(string){
        var BoxModelValueRegEx = new RegExp(BoxModelUtils.BOXMODEL_VALUE_REGEX);
        return BoxModelValueRegEx.test(string);
    };

    exports.BoxModelEditor = BoxModelEditor;
});

