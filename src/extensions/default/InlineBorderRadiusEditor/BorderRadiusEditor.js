
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
    function getIndividualValues(values){
        var flag = true;
        String.prototype.replaceAll = function(str1, str2, ignore) 
        {
            return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)==="string")?str2.replace(/\$/g,"$$$$"):str2);
        } ;
        var temp = values.replaceAll("px","A").replaceAll("%","B").replaceAll("em","C");
        var finalValues = temp.replaceAll("A"," ").replaceAll("B"," ").replaceAll("C"," ").split(" ");
        
        var empty = new Array();
        for(var i=0;i<values.length;i++){
            if(temp[i]==="A"){
                empty.push("A");
            }
            else if(temp[i]==="B"){
                empty.push("B");
            }
            else if(temp[i]==="C"){
                empty.push("C");
            }
        }
        
        if(finalValues.length!==empty.length+1){
            return false;
        }
        var empty2 = new Array();
        for(var j=0;j<empty.length;j++){
           // console.log(typeof finalValues[j]);
            //console.log(finalValues[j].match(/[a-z]/i));
            if(isNaN(parseFloat(finalValues[j])))
            {
                return false;
            }
            empty2.push({num: parseFloat(finalValues[j]),unit:empty[j].replace("A","px").replace("B","%").replace("C","em")});
        }
        return empty2;

    }
    function BorderRadiusEditor($parent, values, callback) {
        // Create the DOM structure, filling in localized strings via Mustache
        this.$element = $(Mustache.render(BorderRadiusTemplate, Strings));
        $parent.append(this.$element);
        this._callback = callback;
        var temp = getIndividualValues(values);
        if(!temp){
            return;
        }
        this.individualValuesWithUnit = temp;                
        this._allCorners = (this.individualValuesWithUnit.length===1);
        //(values.split("px").length===2);
        this._values = values;
        this._originalValues = values;
        this._redoValues = null;
        this._init = true;
        this._tl=null;
        this._tr=null;
        this._br=null;
        this._bl=null;
        this._all=null;
        this._tlUnit=null;
        this._trUnit=null;
        this._brUnit=null;
        this._blUnit=null;
        this._allUnit=null;
        
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
        this.$tltext = this.$element.find("#tltext");
        this.$trtext = this.$element.find("#trtext");
        this.$bltext = this.$element.find("#bltext");
        this.$brtext = this.$element.find("#brtext");
        this.$alltext = this.$element.find("#alltext");
        this.$tlradio = this.$element.find("#tl-radio");
        this.$trradio = this.$element.find("#tr-radio");
        this.$brradio = this.$element.find("#br-radio");
        this.$blradio = this.$element.find("#bl-radio");
        this.$allradio = this.$element.find("#all-radio");
        
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

    BorderRadiusEditor.prototype.getAllRadios = function() {
        var radios = {
            tr : this.$tlradio,
            tl : this.$trradio,
            br : this.$brradio,
            bl : this.$blradio,
            all : this.$allradio
        };
        return radios;
    };

    BorderRadiusEditor.prototype.setValues = function(values) {
        var result = getIndividualValues(values.replaceAll(" ","").replaceAll(";",""));
        if(!result){
            return;
        }


        //var result = values.replace(' ','').replace(";","").split("px");
        var finalValue = "";
        //var count=0;
        /*for(var i = 0; i < result.length; i++){
            if(!isNaN(parseFloat(result[i]))){
                result[i] = parseFloat(result[i])+"px";
                finalValue += result[i];
                count++;
            }
        }*/

        for(var i = 0; i<result.length;i++){
            finalValue += (result[i].num+result[i].unit);
        }

        
        //this._allCorners=(count===1||count===0);
        this._allCorners = (result.length === 1);
        this._values = finalValue;
        this.individualValuesWithUnit = result;
        /*if(count===0){
            this._values = DEFAULT_BORDER_RADIUS_VALUE + "px";
        }*/
        this._setInputValues(true); 
        this._commitChanges(values);
    };

    BorderRadiusEditor.prototype._setInputValues = function(setFromString) {
        var values = this.individualValuesWithUnit;
        //this._values.split("px");
        //var tl,tr,bl,br,all;
            if(!this._allCorners){
                if(values.length===1 && (this._init || setFromString)){
                    
                    this._tr = parseFloat(values[0].num);
                    this._tl = parseFloat(values[0].num);
                    this._br = parseFloat(values[0].num);
                    this._bl = parseFloat(values[0].num); 
                    this._tlUnit=values[0].unit;
                    this._trUnit=values[0].unit;
                    this._brUnit=values[0].unit;
                    this._blUnit= values[0].unit;
                    this._allUnit=this._allUnit || "px";
                    this._all = this._all || 0; 
                    
                }
                else if(values.length===2 && (this._init || setFromString)){
                    this._tl = parseFloat(values[0].num);
                    this._tr = parseFloat(values[1].num);
                    this._br = parseFloat(values[0].num);
                    this._bl = parseFloat(values[1].num);
                    this._tlUnit=values[0].unit;
                    this._trUnit=values[1].unit;
                    this._brUnit=values[0].unit;
                    this._blUnit= values[1].unit;
                    this._allUnit=this._allUnit || "px";
                    this._all = this._all || 0;
                    
                }
                else if(values.length===3 && (this._init || setFromString)){
                    this._tl = parseFloat(values[0].num);
                    this._tr = parseFloat(values[1].num);
                    this._br = parseFloat(values[2].num);
                    this._bl = parseFloat(values[1].num);
                    this._tlUnit=values[0].unit;
                    this._trUnit=values[1].unit;
                    this._brUnit=values[2].unit;
                    this._blUnit= values[1].unit;
                    this._allUnit=this._allUnit || "px";

                    this._all = this._all || 0;
                    
                }
                else if(values.length===4 && (this._init || setFromString)){
                
                    this._tl = parseFloat(values[0].num);
                    this._tr = parseFloat(values[1].num);
                    this._br = parseFloat(values[2].num);
                    this._bl = parseFloat(values[3].num);
                    this._tlUnit=values[0].unit;
                    this._trUnit=values[1].unit;
                    this._brUnit=values[2].unit;
                    this._blUnit= values[3].unit;
                    this._allUnit=this._allUnit || "px";
                    this._all = this._all || 0;
                }

                
                
            }
            else{
                if(this._init || setFromString){
                this._all = parseFloat(values[0].num); 
                this._allUnit = values[0].unit;
                this._tl = this._tl || this._all;
                this._tlUnit = this._tlUnit || this._allUnit;
                this._tr = this._tr || this._all;
                this._trUnit = this._trUnit || this._allUnit;
                this._br = this._br || this._all;
                this._brUnit = this._brUnit || this._allUnit;
                this._bl = this._bl || this._all;
                this._blUnit = this._blUnit || this._allUnit;
                }
                
                //this._tl = this._tl || 0;
                //this._tr = this._tr || 0;
                //this._br = this._br || 0;
                //this._bl = this._bl || 0;
                
                /*this._tl = parseFloat(values[0]);
                this._tr = parseFloat(values[0]);
                this._br = parseFloat(values[0]);
                this._bl = parseFloat(values[0]);*/
            }
            //this._all = this._tl;
            
            /*this._tl = tl;
            this._tr = tr;
            this._br = br;
            this._bl = bl;
            this._all = all;*/
            if(this._init){
                this.setRadioButtons();
            }


            this._init =false;
            
            this.$tlslider.val(this._tl);
            this.$trslider.val(this._tr);
            this.$blslider.val(this._bl);
            this.$brslider.val(this._br);
            this.$tltext.text(this._tl+this._tlUnit);
            this.$trtext.text(this._tr+this._trUnit);
            this.$brtext.text(this._br+this._brUnit);
            this.$bltext.text(this._bl+this._blUnit); 
            this.$alltext.text(this._all+this._allUnit);           
            this.$allCornerSlider.val(this._all);

    };
    BorderRadiusEditor.prototype.setRadioButtons = function(values){
            //when initializing
            if(!values){
                var tl_px,tl_em,tl_percent;
                if(this._tlUnit==="px")
                {
                    tl_px = this.$element.find("#tl-radio-px");
                    tl_px.addClass("selected");
                }
                else if(this._tlUnit==="em")
                {
                    tl_em = this.$element.find("#tl-radio-em");
                    tl_em.addClass("selected");
                }
                else
                {
                    tl_percent = this.$element.find("#tl-radio-percent");
                    tl_percent.addClass("selected");
                }

                var tr_px,tr_em,tr_percent;
                if(this._trUnit==="px")
                {
                    tr_px = this.$element.find("#tr-radio-px");
                    tr_px.addClass("selected");
                }
                else if(this._trUnit==="em")
                {
                    tr_em = this.$element.find("#tr-radio-em");
                    tr_em.addClass("selected");
                }
                else
                {
                    tr_percent = this.$element.find("#tr-radio-percent");
                    tr_percent.addClass("selected");
                }

                var br_px,br_em,br_percent;
                if(this._brUnit==="px")
                {
                    br_px = this.$element.find("#br-radio-px");
                    br_px.addClass("selected");
                }
                else if(this._trUnit==="em")
                {
                    br_em = this.$element.find("#br-radio-em");
                    br_em.addClass("selected");
                }
                else
                {
                    br_percent = this.$element.find("#br-radio-percent");
                    br_percent.addClass("selected");
                }

                var bl_px,bl_em,bl_percent;
                if(this._blUnit==="px")
                {
                    bl_px = this.$element.find("#bl-radio-px");
                    bl_px.addClass("selected");
                }
                else if(this._trUnit==="em")
                {
                    bl_em = this.$element.find("#bl-radio-em");
                    bl_em.addClass("selected");
                }
                else
                {
                    bl_percent = this.$element.find("#bl-radio-percent");
                    bl_percent.addClass("selected");
                }

                var all_px,all_em,all_percent;
                if(this._allUnit==="px")
                {
                    all_px = this.$element.find("#all-radio-px");
                    all_px.addClass("selected");
                }
                else if(this._trUnit==="em")
                {
                    all_em = this.$element.find("#all-radio-em");
                    all_em.addClass("selected");
                }
                else
                {
                    all_percent = this.$element.find("#all-radio-percent");
                    all_percent.addClass("selected");
                }
            }
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
        
        this.$tlradio.bind("click", function(event){
            self._handleTLRadioChange(event);
        });

        this.$trradio.bind("click", function(event){
            self._handleTRRadioChange(event);
        });

        this.$brradio.bind("click", function(event){
            self._handleBRRadioChange(event);
        });

        this.$blradio.bind("click", function(event){
            self._handleBLRadioChange(event);
        });

        this.$allradio.bind("click", function(event){
            self._handleALLRadioChange(event);
        });
        

        this.$allCornerButton.bind("click",function(event){
            self.getButtonAllCorner().addClass("selected");
            self.getButtonIndividualCorner().removeClass("selected");
            var sliders = self.getAllSliders();
            var radios = self.getAllRadios();
                sliders['tl'].prop('disabled',true);
                sliders['bl'].prop('disabled',true);
                sliders['br'].prop('disabled',true);
                sliders['tr'].prop('disabled',true);
                sliders['all'].prop('disabled',false);
                radios['tr'].css('display','none');
                radios['tl'].css('display','none');
                radios['br'].css('display','none');
                radios['bl'].css('display','none');
                radios['all'].css('display','inline');
                
                self.getAllCornerDiv().addClass("allCornersArea");  
                self.getIndividualDiv().removeClass("individualCornerArea");
                self.setAllCornerBooleanFlag(true);
                self._setInputValues();
                var result = self.getAllCornerValues();
                self._commitChanges(result["all"]+self._allUnit);
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
            
                var radios = self.getAllRadios();
                
                radios['tr'].css('display','inline');
                radios['tl'].css('display','inline');
                radios['br'].css('display','inline');
                radios['bl'].css('display','inline');
                radios['all'].css('display','none');
                self.getAllCornerDiv().removeClass("allCornersArea");  
                self.getIndividualDiv().addClass("individualCornerArea");
                self.setAllCornerBooleanFlag(false);
                self._setInputValues();
                var result = self.getAllCornerValues();
                self._commitChanges(result["tl"]+self._tlUnit+" "+result["tr"]+self._trUnit+" "+result["br"]+self._brUnit+" "+result["bl"]+self._blUnit);
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
        //var values = this._values.split("px");
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
            newValue = value+this._tlUnit+" "+this._tr+this._trUnit+" "+this._br+this._brUnit+" "+this._bl+this._blUnit;
            this._values = value+this._tlUnit+this._tr+this._trUnit+this._br+this._brUnit+this._bl+this._blUnit;
            this._tl = value;
            //this._all = this._tl;
        }
        if(propertyName === "TR"){ 
            newValue = this._tl+this._tlUnit+" "+value+this._trUnit+" "+this._br+this._brUnit+" "+this._bl+this._blUnit;
            this._values = this._tl+this._tlUnit+value+this._trUnit+this._br+this._brUnit+this._bl+this._blUnit;
            this._tr = value;
            //this._all = this._tl;
            
        }
        if(propertyName === "BR"){ 
            newValue = this._tl+ this._tlUnit+" "+this._tr+this._trUnit+" "+value+this._brUnit+" "+this._bl+this._blUnit;
            this._values = this._tl+this._tlUnit+this._tr+this._trUnit+value+this._brUnit+this._bl+this._blUnit;
            this._br = value;
            //this._all = this._tl;
            
        }
        if(propertyName === "BL"){ 
            newValue = this._tl+ this._tlUnit+" "+this._tr+this._trUnit+" "+this._br+this._brUnit+" "+value+this._blUnit;
            this._values = this._tl+this._tlUnit+this._tr+this._trUnit+this.br+this._brUnit+value+this._blUnit;
            this._bl = value;
            //this._all = this._tl;
            
        }
        if(propertyName === "ALL"){
            newValue = value+this._allUnit;
            this._values = value+this._allUnit+value+this._allUnit+value+this._allUnit+value+this._allUnit;
            //this._bl=value;
            //this._br=value;
            //this._tl=value;
            //this._tr=value;
            this._all = value;//this._tl;
        }
        this._setInputValues();
        this._commitChanges( newValue);
    };
    
    BorderRadiusEditor.prototype._handleTLCHange = function() {
        var self = this;
        var newValue = this.$tlslider.val().trim();
        _handleChanges.call(self, this.$tlslider, "TL", newValue);
    };
    
    BorderRadiusEditor.prototype._clearAllRadio = function(flag){
        var list;
        if(flag === "tl"){
             list = this.$tlradio.find("li");
             for(var i=0; i<list.length;i++){
                 this.$element.find("#"+list[i].id).removeClass("selected");
             }            
        }
        if(flag === "bl"){
            list = this.$blradio.find("li");
            for(var i=0; i<list.length;i++){
                this.$element.find("#"+list[i].id).removeClass("selected");
            }            
        }
        if(flag === "tr"){
            list = this.$trradio.find("li");
            for(var i=0; i<list.length;i++){
                this.$element.find("#"+list[i].id).removeClass("selected");
            }            
        }
        if(flag === "br"){
            list = this.$brradio.find("li");
            for(var i=0; i<list.length;i++){
                this.$element.find("#"+list[i].id).removeClass("selected");
            }            
        }
        if(flag === "all"){
            list = this.$allradio.find("li");
            for(var i=0; i<list.length;i++){
                this.$element.find("#"+list[i].id).removeClass("selected");
            }            
        }
   };
    
    BorderRadiusEditor.prototype.updateRadios=function(corner,unit){
        if(corner==="tl"){
            if(unit==="percent"){
                
                this._tlUnit = "%";
            }
            else{
                this._tlUnit = unit;
            }
        }

        if(corner==="tr"){
            if(unit==="percent"){
                this._trUnit = "%";
            }
            else{
                this._trUnit = unit;
            }
        }

        if(corner==="br"){
            if(unit==="percent"){
                this._brUnit = "%";
            }
            else{
                this._brUnit = unit;
            }
        }

        if(corner==="bl"){
            if(unit==="percent"){
                this._blUnit = "%";
            }
            else{
                this._blUnit = unit;
            }
        }

        if(corner==="all"){
            if(unit==="percent"){
                this._allUnit = "%";
            }
            else{
                this._allUnit = unit;
            }
        }
        this._setInputValues();
        var newValue;
        if(!this._allCorners){
         newValue = this._tl+ this._tlUnit+" "+this._tr+this._trUnit+" "+this._br+this._brUnit+" "+this._bl+this._blUnit;
        }
        else{
            newValue = this._all+this._allUnit;
        }
        this._commitChanges(newValue);
        
    };
    BorderRadiusEditor.prototype._handleTLRadioChange = function(event){
        this._clearAllRadio("tl");
        this.$element.find("#"+event.target.parentNode.id).addClass("selected");
        var unit = event.target.parentNode.id.split("-");
        this.updateRadios("tl",unit[2]);
    };

    BorderRadiusEditor.prototype._handleTRRadioChange = function(event){
        this._clearAllRadio("tr");
        this.$element.find("#"+event.target.parentNode.id).addClass("selected");
        var unit = event.target.parentNode.id.split("-");
        this.updateRadios("tr",unit[2]);
    };

    BorderRadiusEditor.prototype._handleBRRadioChange = function(event){
        this._clearAllRadio("br");
        this.$element.find("#"+event.target.parentNode.id).addClass("selected");
        var unit = event.target.parentNode.id.split("-");
        this.updateRadios("br",unit[2]);
    };

    BorderRadiusEditor.prototype._handleBLRadioChange = function(event){
        this._clearAllRadio("bl");
        this.$element.find("#"+event.target.parentNode.id).addClass("selected");
        var unit = event.target.parentNode.id.split("-");
        this.updateRadios("bl",unit[2]);
    };

    BorderRadiusEditor.prototype._handleALLRadioChange = function(event){
        this._clearAllRadio("all");
        this.$element.find("#"+event.target.parentNode.id).addClass("selected");
        var unit = event.target.parentNode.id.split("-");
        this.updateRadios("all",unit[2]);
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
