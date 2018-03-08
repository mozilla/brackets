define(function(require, exports, module) {
    "use strict";

    var EditorManager          = brackets.getModule("editor/EditorManager"),
        ExtensionUtils         = brackets.getModule("utils/ExtensionUtils"),
        InlineBoxShadowEditor  = require("InlineBoxShadowEditor").InlineBoxShadowEditor,
        ColorUtils             = brackets.getModule("utils/ColorUtils"),
        BoxShadowUtils         = require("BoxShadowUtils");

    /**
     * Prepare hostEditor for an InlineBoxShadowEditor at pos if possible. Return
     * editor context if so; otherwise null.
     *
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{values:{}, marker:TextMarker}}
     */
    function prepareEditorForProvider(hostEditor, pos) {
        if(queryInlineBoxShadowEditorProvider(hostEditor, pos) === false) {
            return null;
        }

        var cursorLine, semiColonPos, colonPos, endPos, cursorLineSubstring, marker, boxShadowString, isEmptyString, pos, firstCharacterPos, endPos,
        boxShadowRegex;

        boxShadowRegex = new RegExp(BoxShadowUtils.BOX_SHADOW_REGEX);

        cursorLine = hostEditor.document.getLine(pos.line);
        colonPos = cursorLine.indexOf(":");
        semiColonPos = cursorLine.indexOf(";");
        if(semiColonPos !== -1) {
            endPos = semiColonPos;
        }
        else {
            endPos = cursorLine.length;
        }

        cursorLineSubstring = cursorLine.substring(colonPos + 1, endPos).trim();

        // Get the initial set of values of box-shadow property
        isEmptyString = false;

        if(cursorLineSubstring.length === 0) {
            isEmptyString = true;
            boxShadowString = BoxShadowUtils.DEFAULT_BOX_SHADOW_VALUE;
        }
        else {
            if(boxShadowRegex.test(cursorLineSubstring) === true) {
                boxShadowString = cursorLineSubstring;
            }
            else {
                return null;
            }
        }

        if(isEmptyString) {
            //Edit a new css rule.
            var from ,to, newText;
            from = {line: pos.line, ch: colonPos + 1};
            to = {line: pos.line, ch: cursorLine.length};
            newText = boxShadowString.concat(";");
            hostEditor._codeMirror.replaceRange(newText, from, to);
            pos.ch = colonPos + 2;
            endPos = {line: pos.line, ch: pos.ch + boxShadowString.length};
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

        return {
            string: boxShadowString,
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
            inlineBoxShadowEditor = new InlineBoxShadowEditor(context.string, context.marker);
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