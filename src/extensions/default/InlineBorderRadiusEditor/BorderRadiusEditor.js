
define(function(require, exports, module) {
    "use strict";

    var KeyEvent           = brackets.getModule("utils/KeyEvent"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        StringUtils        = brackets.getModule("utils/StringUtils"),
        Strings            = brackets.getModule("strings"),
        Mustache           = brackets.getModule("thirdparty/mustache/mustache"),
        BorderRadiusUtils   = brackets.getModule("utils/BorderRadiusUtils");
        
       // tinycolor          = require("thirdparty/tinycolor-min")

    /** Mustache template that forms the bare DOM structure of the UI */
    var BorderRadiusTemplate = require("text!BorderRadiusEditorTemplate.html");
    var DEFAULT_BORDER_RADIUS_VALUE = 0;
    /**
     * Box shadow editor control; may be used standalone or within an InlineBoxShadowEditor inline widget.
     * @param {!jQuery} $parent  DOM node into which to append the root of the box-shadow editor UI
     * @param {!{horizontalOffset: string, verticalOffset: string, blurRadius: string, spreadRadius: string, color: string}} values  Initial set of box-shadow values.
     * @param {!function(string)} callback  Called whenever values change
     */
    function BorderRadiusEditor($parent, values, callback) {
        // Create the DOM structure, filling in localized strings via Mustache
        this.$element = $(Mustache.render(BorderRadiusTemplate, Strings));
        $parent.append(this.$element);
        
        this._callback = callback;
        this._allCorners = (values.split("px").length===2);
        this._values = values;
        this._originalValues = values;
        this._redoValues = null;
        
        this._tl=null;
        this._tr=null;
        this._br=null;
        this._bl=null;
        this._all=null;
        
        // Get references
        this.$tlslider = this.$element.find("#top-left-slider");
        this.$trslider = this.$element.find("#top-right-slider");
        this.$blslider = this.$element.find("#bottom-left-slider");
        this.$brslider = this.$element.find("#bottom-right-slider");

        //allcorner button reference
        this.$allCornerButton = this.$element.find("#allCorners");

        this.$allCornerSlider = this.$element.find("#all-corner-slider");
        this.$individualCorner = this.$element.find("#individualCorners");
        this.$individualCornerArea = this.$element.find("#individualCornerArea");
        this.$allCornersArea = this.$element.find("#allCornersArea");

        // Attach event listeners to main UI elements
        this._bindInputHandlers();
        //initialize individual corner editing to be disabled
        if(this._allCorners){ 
            this.$allCornerButton.trigger("click");
        }
        else{
            this.$individualCorner.trigger("click");
        }
        // Set initial values in the box-shadow editor inputs.
        this._setInputValues();
    }

    /**
     * A string or tinycolor object representing the currently selected color
     * TODO (#2201): type is unpredictable
     * @type {tinycolor|string}
     */
    BorderRadiusEditor.prototype._values = null;

    /**
     * box shadow values that was selected before undo(), if undo was the last change made. Else null.
     * @type {?string}
     */
    BorderRadiusEditor.prototype._redoValues = null;

    /**
     * Initial value the BoxShadow picker was opened with
     * @type {!string}
     */
    BorderRadiusEditor.prototype._originalValues = null;


    /** Returns the root DOM node of the BoxShadowPicker UI */
    BorderRadiusEditor.prototype.getRootElement = function () {
        return this.$element;
    };

    BorderRadiusEditor.prototype.getAllSliders = function() {
        var sliders = {
            tr : this.$trslider,
            tl : this.$tlslider,
            br : this.$brslider,
            bl : this.$blslider,
            all : this.$allCornerSlider
        };
        return sliders;
    };

    BorderRadiusEditor.prototype.setValues = function(values) {
        var result = values.replace(' ','').replace(";","").split("px");
        var finalValue = "";
        var count=0;
        for(var i = 0; i < result.length; i++){
            if(!isNaN(parseFloat(result[i]))){
                result[i] = parseFloat(result[i])+"px";
                finalValue += result[i];
                count++;
            }
        }
        this._allCorners=(count===1||count===0);
        this._values = finalValue;
        if(count===0){
            this._values = DEFAULT_BORDER_RADIUS_VALUE + "px";
        }
        this._setInputValues(); 
        this._commitChanges(values);
    };

    BorderRadiusEditor.prototype._setInputValues = function() {
        var values = this._values.split("px");
        //var tl,tr,bl,br,all;
            if(!this._allCorners){
                if(values.length===2){
                    
                    this._tr = parseFloat(values[0]);
                    this._tl = parseFloat(values[0]);
                    this._br = parseFloat(values[0]);
                    this._bl = parseFloat(values[0]);            
                }
                else if(values.length===3){
                    this._tl = parseFloat(values[0]);
                    this._tr = parseFloat(values[1]);
                    this._br = parseFloat(values[0]);
                    this._bl = parseFloat(values[1]);
                }
                else if(values.length===4){
                    this._tl = parseFloat(values[0]);
                    this._tr = parseFloat(values[1]);
                    this._br = parseFloat(values[2]);
                    this._bl = parseFloat(values[1]);
                }
                else if(values.length===5){
                
                    this._tl = parseFloat(values[0]);
                    this._tr = parseFloat(values[1]);
                    this._br = parseFloat(values[2]);
                    this._bl = parseFloat(values[3]);
                }
                
            }
            else{
                this._tl = parseFloat(values[0]);
                this._tr = parseFloat(values[0]);
                this._br = parseFloat(values[0]);
                this._bl = parseFloat(values[0]);
            }
            this._all = this._tl;
            
            /*this._tl = tl;
            this._tr = tr;
            this._br = br;
            this._bl = bl;
            this._all = all;*/
            this.$tlslider.val(this._tl);
            this.$trslider.val(this._tr);
            this.$blslider.val(this._bl);
            this.$brslider.val(this._br);
            this.$allCornerSlider.val(this._all);

    };

    BorderRadiusEditor.prototype._bindInputHandlers = function() {
        var self = this;

        this.$tlslider.bind("input", function(event){
            self._handleTLCHange();
        });

        this.$trslider.bind("input", function(event){
            self._handleTRCHange();
        });

        this.$blslider.bind("input", function(event){
            self._handleBLCHange();
        });

        this.$brslider.bind("input", function(event){
            self._handleBRCHange();
        });
        this.$allCornerSlider.bind("input",function(event){
            self._handleALLCHange();
        });

        this.$allCornerButton.bind("click",function(event){
            self.getButtonAllCorner().addClass("selected");
            self.getButtonIndividualCorner().removeClass("selected");
            var sliders = self.getAllSliders();
           
                sliders['tl'].prop('disabled',true);
                sliders['bl'].prop('disabled',true);
                sliders['br'].prop('disabled',true);
                sliders['tr'].prop('disabled',true);
                sliders['all'].prop('disabled',false);
                self.getAllCornerDiv().addClass("allCornersArea");  
                self.getIndividualDiv().removeClass("individualCornerArea");
                self.setAllCornerBooleanFlag(true);
                self._setInputValues();
                var result = self.getAllCornerValues();
                self._commitChanges(result["all"]+"px");
        });
        this.$individualCorner.bind("click",function(event){
            self.getButtonIndividualCorner().addClass("selected");
            self.getButtonAllCorner().removeClass("selected");
            var sliders = self.getAllSliders();
            
                sliders['tl'].prop('disabled',false);
                sliders['bl'].prop('disabled',false);
                sliders['br'].prop('disabled',false);
                sliders['tr'].prop('disabled',false);
                sliders['all'].prop('disabled',true);                
                self.getAllCornerDiv().removeClass("allCornersArea");  
                self.getIndividualDiv().addClass("individualCornerArea");
                self.setAllCornerBooleanFlag(false);
                self._setInputValues();
                var result = self.getAllCornerValues();
                self._commitChanges(result["tl"]+"px "+result["tr"]+"px "+result["br"]+"px "+result["bl"]+"px");
        });
    };

    BorderRadiusEditor.prototype.focus = function() {
        this.$tlslider.focus();
    };

    BorderRadiusEditor.prototype.setAllCornerBooleanFlag=function(flag){
        this._allCorners = flag;
    };

    BorderRadiusEditor.prototype.destroy = function() {
    };
    
    BorderRadiusEditor.prototype.getAllCornerValues=function(){
        var result = {
            tl : this._tl,
            tr : this._tr,
            br : this._br,
            bl : this._bl,
            all : this._all
        };
        return result;
    };
    
    BorderRadiusEditor.prototype.getValues = function() {
        return this._values;
    };
    
    BorderRadiusEditor.prototype.getButtonAllCorner = function(){
        return this.$allCornerButton;
    };

    BorderRadiusEditor.prototype.getButtonIndividualCorner = function(){
        return this.$individualCorner;
    };

    BorderRadiusEditor.prototype.getAllCornerDiv = function(){
        return this.$allCornersArea;
    };

    BorderRadiusEditor.prototype.getIndividualDiv = function(){
        return this.$individualCornerArea;
    };

    // Utilty function to check if data is of correct format.
    BorderRadiusEditor.prototype._isValidNumber = function(data) {
        return (data.match(/\-?\d*/) !== null);
    };

    BorderRadiusEditor.prototype._isValidBorderRadiusString = function(string){
        var radiusValueRegEx = new RegExp(BorderRadiusUtils.BORDER_RADIUS_VALUE_REGEX);
        return radiusValueRegEx.test(string);
    };

    BorderRadiusEditor.prototype.setBorderRadiusFromString = function(value) {
        this.setValues(value);
    };
        
    function _handleChanges($inputElement, propertyName, value) {
        var values = this._values.split("px");
        if(!this._isValidNumber(value)) {
            if(!this._values[propertyName]) {
                $inputElement.val("");
                return;
            }
            var curValue = parseFloat(this._values[propertyName]);
            $inputElement.val(curValue);
        }

        if(value === "") {
            // This is to maintain the box-shadow property.
            value = "0";
            $inputElement.val(value);
        }
        
        var newValue; 
        
        if(propertyName === "TL"){ 
            newValue = value+"px "+this._tr+"px "+this._br+"px "+this._bl+"px";
            this._values = value+"px"+this._tr+"px"+this._br+"px"+this._bl+"px";
            this._tl = value;
            this._all = this._tl;
        }
        if(propertyName === "TR"){ 
            newValue = this._tl+"px "+value+"px "+this._br+"px "+this._bl+"px";
            this._values = this._tl+"px"+value+"px"+this._br+"px"+this._bl+"px";
            this._tr = value;
            this._all = this._tl;
            
        }
        if(propertyName === "BR"){ 
            newValue = this._tl+"px "+this._tr+"px "+value+"px "+this._bl+"px";
            this._values = this._tl+"px"+this._tr+"px"+value+"px"+this._bl+"px";
            this._br = value;
            this._all = this._tl;
            
        }
        if(propertyName === "BL"){ 
            newValue = this._tl+"px "+this._tr+"px "+this._br+"px "+value+"px";
            this._values = this._tl+"px"+this._tr+"px"+this._br+"px"+value+"px";
            this._bl = value;
            this._all = this._tl;
            
        }
        if(propertyName === "ALL"){
            newValue = value+"px";
            this._values = value+"px"+value+"px"+value+"px"+value+"px";
            this._bl=value;
            this._br=value;
            this._tl=value;
            this._tr=value;
            this._all = this._tl;
        }
        this._setInputValues();
        this._commitChanges( newValue);
    };
    
    BorderRadiusEditor.prototype._handleTLCHange = function() {
        var self = this;
        var newValue = this.$tlslider.val().trim();
        _handleChanges.call(self, this.$tlslider, "TL", newValue);
    };

    BorderRadiusEditor.prototype._handleTRCHange = function() {
        var self = this;
        var newValue = this.$trslider.val().trim();
        _handleChanges.call(self, this.$trslider, "TR", newValue);
    };

    BorderRadiusEditor.prototype._handleBLCHange = function() {
        var self = this;
        var newValue = this.$blslider.val().trim();
        _handleChanges.call(self, this.$blslider, "BL", newValue);
    };

    BorderRadiusEditor.prototype._handleBRCHange = function() {
        var self = this;
        var newValue = this.$brslider.val().trim();
        _handleChanges.call(self, this.$brslider, "BR", newValue);
    };

    BorderRadiusEditor.prototype._handleALLCHange = function() {
        var self = this;
        var newValue = this.$allCornerSlider.val().trim();
        _handleChanges.call(self, this.$allCornerSlider, "ALL", newValue);
    };

    BorderRadiusEditor.prototype._undo = function() {
        
    };

    BorderRadiusEditor.prototype._redo = function() {
  
    };

    /**
    * Global handler for keys in the color editor. Catches undo/redo keys and traps
    * arrow keys that would be handled by the scroller.
    */
    BorderRadiusEditor.prototype._handleKeydown = function (event) {
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


    BorderRadiusEditor.prototype._commitChanges = function(value) {
        var result="";
        var _array = value.split(" ");
        for(var i=0;i<_array.length;i++){
            result+=_array[i];
        }
        this._values = result;
        this._callback(value);
    };


    exports.BorderRadiusEditor = BorderRadiusEditor;
});
