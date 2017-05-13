/*
 * File based on InlineColorEditor/main.js
 */

define(function (require, exports, module) {
    "use strict";

    var EditorManager           = brackets.getModule("editor/EditorManager"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        HTMLUtils               = brackets.getModule("language/HTMLUtils"),
        Inline3dParametersUtils = require("Parameters3DUtils"),
        Inline3DParameterEditor = require("Inline3DParameterEditor").Inline3DParameterEditor;

    /*
     * Used for determining if the current tag is of type <a-*
     * Right now the inline Widget functionality if limited to
     * Aframe HTML tags.
     * @param {tag} tag of the html line containing pos
     * @return {boolean}
     */
    function is3DParameter(tag) {
        var tagStart =Inline3dParametersUtils.TAG_START;
        return (tag.substr(0, 2) === tagStart); 
    }

    /*
     * Check if a mathc exists for the PARAMETERS_3D_REGEX
     * that contains the position pos.
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{parameter:String, marker:TextMarker}}
     */
    function getMatch(hostEditor, pos, tagInfo) {
        var match, cursorLine, ParameterRegex, start, end, endPos, marker ;
        ParameterRegex = Inline3dParametersUtils.PARAMETERS_3D_REGEX;
        ParameterRegex.lastIndex = 0;
        cursorLine = hostEditor.document.getLine(pos.line);
        match = ParameterRegex.exec(cursorLine);

        // The loop returns the first match to the regex ParameterRegex
        // Returns null in case no match is found
        while(match) {
            start = match.index;
            end = start + match[0].trim().length;
            if (pos.ch >= start && pos.ch <= end) {
                break;
            }
            // look for the next match since a match containing the cursor is not found yet
            match = ParameterRegex.exec(cursorLine);
        }

        if(!match) {
            return null;
        }

        // Adjust pos to the beginning of the match so that the inline editor won't get
        // dismissed while we're updating the parameters with the new values from user's inline editing.
        pos.ch = start;
        endPos = {line: pos.line, ch: end};

        marker = hostEditor._codeMirror.markText(pos, endPos);
        hostEditor.setSelection(pos, endPos);

        return {
            parameters: match[0],
            marker: marker,
            tag : tagInfo.attr.name
        };
    }

    /**
     * Prepare hostEditor for an Inline3DParameterEditor at pos if possible. Return
     * editor context if so; otherwise null.
     *
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{parameter:String, marker:TextMarker}}
     */
    function prepareParametersForProvider(hostEditor, pos) {
        var match, sel, tagInfo;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return null;
        }
        var tagInfo = HTMLUtils.getTagInfo(hostEditor, sel.start);
        if(!is3DParameter(tagInfo.tagName)) {
            return null;
        }

        return getMatch(hostEditor, pos, tagInfo);
    }

    /**
     * Registered as an inline editor provider: creates an InlineEditorParameter when the cursor
     * is on a parameters (in any flavor of code).
     *
     * @param {!Editor} hostEditor
     * @param {!{line:Number, ch:Number}} pos
     * @return {?$.Promise} synchronously resolved with an InlineWidget, or null if there's
     *      no parameters at pos.
     */
    function inline3DParametersEditor(hostEditor, pos) {
        var context = prepareParametersForProvider(hostEditor, pos),
            inline3DParameterEditor,
            result;

        if (!context) {
            return null;
        }
        inline3DParameterEditor = new Inline3DParameterEditor(context.parameters, context.marker, context.tag);
        inline3DParameterEditor.load(hostEditor);

        result = new $.Deferred();
        return result.resolve(inline3DParameterEditor).promise();
    }

    ExtensionUtils.loadStyleSheet(module, "css/main.less");
    EditorManager.registerInlineEditProvider(inline3DParametersEditor);
    exports.prepareParametersForProvider = prepareParametersForProvider;
});
