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

    /**
     * Prepare hostEditor for an Inline3DParameterEditor at pos if possible. Return
     * editor context if so; otherwise null.
     *
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{parameter:String, marker:TextMarker}}
     */
    function prepareParametersForProvider(hostEditor, pos) {
        var ParameterRegex, tagStart, cursorLine, match, sel, start, end, endPos, marker, tagInfo;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return null;
        }
        var tagInfo = HTMLUtils.getTagInfo(hostEditor, sel.start);
        var tag = tagInfo.tagName;
        tagStart =Inline3dParametersUtils.TAG_START;
        if(!tag.substr(0, 2) === tagStart) {
            return null;
        }

        ParameterRegex = new RegExp(Inline3dParametersUtils.PARAMETERS_3D_REGEX);
        tagInfo = HTMLUtils.getTagInfo(hostEditor, pos),
        cursorLine = hostEditor.document.getLine(pos.line);

        // Loop through each match of ParameterRegex and stop when the one that contains pos is found.
        do {
            match = ParameterRegex.exec(cursorLine);
            if (match) {
                start = match.index;
                end = start + match[0].length;
            }
        } while (match && (pos.ch < start || pos.ch > end));

        if (!match) {
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
        result.resolve(inline3DParameterEditor);
        return result.promise();
    }

    ExtensionUtils.loadStyleSheet(module, "css/main.less");
    EditorManager.registerInlineEditProvider(inline3DParametersEditor);
    exports.prepareParametersForProvider = prepareParametersForProvider;
});
