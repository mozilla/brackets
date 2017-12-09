define(function(require, exports, module) {
    "use strict";

    var EditorManager          = brackets.getModule("editor/EditorManager"),
        ExtensionUtils         = brackets.getModule("utils/ExtensionUtils"),
        InlineBoxShadowEditor  = require("InlineBoxShadowEditor").InlineBoxShadowEditor,
        ColorUtils             = brackets.getModule("utils/ColorUtils"),
        boxShadowValueTypes    = JSON.parse(require("text!BoxShadowValueTypes.json")).boxShadowValueTypes;

    var DEFAULT_VALUES = "0px 0px 0px 0px black";

    /**
     * Prepare hostEditor for an InlineBoxShadowEditor at pos if possible. Return
     * editor context if so; otherwise null.
     *
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{values:{}, marker:TextMarker}}
     */
    function prepareEditorForProvider(hostEditor, pos) {
        if(queryInlineBoxShadowEditorProvider(hostEditor, pos) == false) {
            return null;
        }

        var cursorLine, semiColonPos, colonPos, cursorLineSubstring, marker, values, isEmptyString, pos, firstCharacterPos, endPos, boxShadowValueIndex;
        values = {};

        cursorLine = hostEditor.document.getLine(pos.line);
        colonPos = cursorLine.indexOf(":");
        semiColonPos = cursorLine.indexOf(";");
        cursorLineSubstring = cursorLine.substring(colonPos + 1, cursorLine.length);

        // Get the initial set of values of box-shadow property
        isEmptyString = true;
        boxShadowValueIndex = 0;
        cursorLineSubstring.split(/\s+/).forEach(function(value, index) {
            value = value.trim();
            var colorMatch = value.match(ColorUtils.COLOR_REGEX);
            var pixelMatch = value.match(/(\d+)px/);
            console.log(value, colorMatch, pixelMatch);
            if(colorMatch) {
                values["color"] = colorMatch[0];
                isEmptyString = false;
            }
            else if(pixelMatch){
                values[boxShadowValueTypes[boxShadowValueIndex++]] = value;
                isEmptyString = false;
            }
        });

        console.log(isEmptyString);

        if(isEmptyString) {
            //Edit a new css rule.
            var newText = " ", from ,to;
            newText = newText.concat(DEFAULT_VALUES, ";");
            from = {line: pos.line, ch: colonPos + 1};
            to = {line: pos.line, ch: cursorLine.length};
            hostEditor._codeMirror.replaceRange(newText, from, to);
            pos.ch = colonPos + 2;
            endPos = {line: pos.line, ch: pos.ch + DEFAULT_VALUES.length};
            values = {
                "horizontalOffset": "0px",
                "verticalOffset": "0px",
                "blurRadius": "0px",
                "spreadRadius": "0px",
                "color": "black"
            };
        }
        else {
            firstCharacterPos = cursorLineSubstring.search(/\S/);
            pos.ch = colonPos + 1 + Math.min(firstCharacterPos,1);
            if (semiColonPos !== -1) {
                endPos = {line: pos.line, ch: semiColonPos};
            } else {
                endPos = {line: pos.line, ch: cursorLine.length};
            }
        }

        marker = hostEditor._codeMirror.markText(pos, endPos);
        hostEditor.setSelection(pos, endPos);

        console.log(values);

        return {
            values: values,
            marker: marker
        };
    }

    /**
     * Registered as an inline editor provider: creates an InlineBoxShadowEditor when the cursor
     * is on a line containing box-shadow property (in any flavor of code).
     *
     * @param {!Editor} hostEditor
     * @param {!{line:Number, ch:Number}} pos
     * @return {?$.Promise} synchronously resolved with an InlineWidget, or null if there's
     *      no box-shadow at pos.
     */
    function inlineBoxShadowEditorProvider(hostEditor, pos) {
        var context = prepareEditorForProvider(hostEditor, pos),
            inlineBoxShadowEditor,
            result;
    
        if(!context) {
            return null;
        }
        else {
            inlineBoxShadowEditor = new InlineBoxShadowEditor(context.values, context.marker);
            inlineBoxShadowEditor.load(hostEditor);

            result = new $.Deferred();
            result.resolve(inlineBoxShadowEditor);
            return result.promise();
        }
    }

    function queryInlineBoxShadowEditorProvider(hostEditor, pos) {
        var cursorLine = hostEditor.document.getLine(pos.line);

        if(cursorLine.indexOf("box-shadow") !== -1) {
            return true;
        }
        else {
            return false;
        }
    }

    // Initialize extension
    ExtensionUtils.loadStyleSheet(module, "css/style.less");

    EditorManager.registerInlineEditProvider(inlineBoxShadowEditorProvider, queryInlineBoxShadowEditorProvider);

    // for use by other InlineColorEditors
    exports.prepareEditorForProvider = prepareEditorForProvider;
});