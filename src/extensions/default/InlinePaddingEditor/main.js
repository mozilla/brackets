/*
 * Copyright (c) 2012 - present Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

define(function (require, exports, module) {
    "use strict";

    var EditorManager = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        InlinePaddingEditor = require("InlinePaddingEditor").InlinePaddingEditor,
        properties = JSON.parse(require("text!PaddingProperties.json")),
        PaddingUtils = require("PaddingUtils"),
        InlineWidget = brackets.getModule("editor/InlineWidget").InlineWidget;
 
    var DEFAULT_PADDING = "15px";

    /**
     * editor context if so; otherwise null.
     *
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{paddingValue:String, marker:TextMarker}}
     */
    function prepareEditorForProvider(hostEditor, pos) {
        var paddingRegEx, paddingValueRegEx, cursorLine, match, sel, start, end, endPos, marker;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return null;
        }

        paddingRegEx = new RegExp(PaddingUtils.PADDING_REGEX);
        paddingValueRegEx = new RegExp(PaddingUtils.PADDING_VALUE_REGEX);
        cursorLine = hostEditor.document.getLine(pos.line);

        // Loop through each match of paddingRegEx and stop when the one that contains pos is found.
        do {
            match = paddingRegEx.exec(cursorLine);
            if (match) {
                start = match.index;
                end = start + match[0].length;
            }
        } while (match && (pos.ch < start || pos.ch > end));

        if(match){
            // Check if the cursorLine has a CSS rule of type padding
            var cssPropertyName, semiColonPos, colonPos, paddingValue, cursorLineSubstring, firstCharacterPos;

            // Get the css property name after removing spaces and ":" so that we can check for it in the file PaddingProperties.json
            cssPropertyName = cursorLine.split(':')[0].trim();

            if (!cssPropertyName || !properties[cssPropertyName]) {
                return null;
            }

            if (properties[cssPropertyName]) {
                colonPos = cursorLine.indexOf(":");
                semiColonPos = cursorLine.indexOf(";");
                cursorLineSubstring = cursorLine.substring(colonPos + 1, cursorLine.length);
                paddingValue = cursorLineSubstring.replace(/ /g,"").replace(";", "");
                if (paddingValue) {
                    if (paddingValueRegEx.test(paddingValue)) {
                        // edit the padding value of an existing css rule
                        firstCharacterPos = cursorLineSubstring.search(/\S/);
                        pos.ch = colonPos + 1 + Math.min(firstCharacterPos,1);
                        if (semiColonPos !== -1) {
                            endPos = {line: pos.line, ch: semiColonPos};
                        } else {
                            endPos = {line: pos.line, ch: cursorLine.length};
                        }
                    } else {
                         return null;
                    }
                } else {
                    // edit the padding value of a new css rule
                    var newText = " ", from, to;
                    newText = newText.concat(DEFAULT_PADDING, ";");
                    from = {line: pos.line, ch: colonPos + 1};
                    to = {line: pos.line, ch: cursorLine.length};
                    hostEditor._codeMirror.replaceRange(newText, from, to);
                    pos.ch = colonPos + 2;
                    endPos = {line: pos.line, ch: pos.ch + DEFAULT_PADDING.length};
                    paddingValue = DEFAULT_PADDING;
                }

                marker = hostEditor._codeMirror.markText(pos, endPos);
                hostEditor.setSelection(pos, endPos);

                return {
                    padding: paddingValue,
                    marker: marker
                };
            }
        }
        return null;
    }

    /**
     * Registered as an inline editor provider: creates an InlinePaddingEditor when the cursor
     * is on a padding value (in any flavor of code).
     *
     * @param {!Editor} hostEditor
     * @param {!{line:Number, ch:Number}} pos
     * @return {?$.Promise} synchronously resolved with an InlineWidget, or null if there's
     * no padding at pos.
     */
    function inlinePaddingEditorProvider(hostEditor, pos) {
        var context = prepareEditorForProvider(hostEditor, pos),
        inlinePaddingEditor,
            result;

        if (!context) {
            return null;
        } else {
            inlinePaddingEditor = new InlinePaddingEditor(context.padding, context.marker);
            inlinePaddingEditor.load(hostEditor);

            result = new $.Deferred();
            result.resolve(inlinePaddingEditor);
            return result.promise();
        }
    }

    function queryInlinePaddingEditorProvider(hostEditor, pos) {
        var paddingRegEx, cursorLine, match, sel, start, end, endPos, marker;
        var cssPropertyName, semiColonPos, colonPos, paddingValue, cursorLineSubstring, firstCharacterPos;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return false;
        }

        paddingRegEx = new RegExp(PaddingUtils.PADDING_REGEX);
        cursorLine = hostEditor.document.getLine(pos.line);

        // Loop through each match of paddingRegEx and stop when the one that contains pos is found.
        do {
            match = paddingRegEx.exec(cursorLine);
            if (match) {
                start = match.index;
                end = start + match[0].length;
            }
        } while (match && (pos.ch < start || pos.ch > end));

        if (match) {
            return true;
        }

        // Get the css property name after removing spaces and ":" so that we can check for it in the file PaddingProperties.json
        cssPropertyName = cursorLine.split(':')[0].trim();

        if (!cssPropertyName || !properties[cssPropertyName]) {
            return false;
        }

        if (properties[cssPropertyName]) {
            colonPos = cursorLine.indexOf(":");
            semiColonPos = cursorLine.indexOf(";");
            cursorLineSubstring = cursorLine.substring(colonPos + 1, cursorLine.length);
            paddingValue = cursorLineSubstring.replace(/ /g,"").replace(";", "");
            if (paddingValue) {
                return paddingRegEx.test(paddingValue);
            }
            return true;
        }

        return false;
    }

    // Initialize extension
    ExtensionUtils.loadStyleSheet(module, "css/main.less");
    EditorManager.registerInlineEditProvider(inlinePaddingEditorProvider, queryInlinePaddingEditorProvider);
    exports.prepareEditorForProvider = prepareEditorForProvider;
    exports.inlinePaddingEditorProvider = inlinePaddingEditorProvider;
});

