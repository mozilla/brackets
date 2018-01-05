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
        InlineBorderRadiusEditor = require("InlineBorderRadiusEditor").InlineBorderRadiusEditor,
        properties = JSON.parse(require("text!BorderRadiusProperties.json")),
        BorderRadiusUtils = require("BorderRadiusUtils");

    var DEFAULT_RADIUS = "15px";

    /**
     * editor context if so; otherwise null.
     *
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{radiusValue:String, marker:TextMarker}}
     */
    function prepareEditorForProvider(hostEditor, pos) {
        var radiusRegEx, radiusValueRegEx, cursorLine, match, sel, start, end, endPos, marker;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return null;
        }

        radiusRegEx = new RegExp(BorderRadiusUtils.BORDER_RADIUS_REGEX);
        radiusValueRegEx = new RegExp(BorderRadiusUtils.BORDER_RADIUS_VALUE_REGEX);
        cursorLine = hostEditor.document.getLine(pos.line);

        // Loop through each match of radiusRegEx and stop when the one that contains pos is found.
        do {
            match = radiusRegEx.exec(cursorLine);
            if (match) {
                start = match.index;
                end = start + match[0].length;
            }
        } while (match && (pos.ch < start || pos.ch > end));

        if(match){
            // Check if the cursorLine has a CSS rule of type border-radius
            var cssPropertyName, semiColonPos, colonPos, radiusValue, cursorLineSubstring, firstCharacterPos;

            // Get the css property name after removing spaces and ":" so that we can check for it in the file BorderRadiusProperties.json
            cssPropertyName = cursorLine.split(':')[0].trim();

            if (!cssPropertyName || !properties[cssPropertyName]) {
                return null;
            }

            if (properties[cssPropertyName]) {
                colonPos = cursorLine.indexOf(":");
                semiColonPos = cursorLine.indexOf(";");
                cursorLineSubstring = cursorLine.substring(colonPos + 1, cursorLine.length);
                radiusValue = cursorLineSubstring.replace(/ /g,"").replace(";", "");
                if (radiusValue) {
                    if (radiusValueRegEx.test(radiusValue)) {
                        // edit the radius value of an existing css rule
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
                    // edit the radius value of a new css rule
                    var newText = " ", from, to;
                    newText = newText.concat(DEFAULT_RADIUS, ";");
                    from = {line: pos.line, ch: colonPos + 1};
                    to = {line: pos.line, ch: cursorLine.length};
                    hostEditor._codeMirror.replaceRange(newText, from, to);
                    pos.ch = colonPos + 2;
                    endPos = {line: pos.line, ch: pos.ch + DEFAULT_RADIUS.length};
                    radiusValue = DEFAULT_RADIUS;
                }

                marker = hostEditor._codeMirror.markText(pos, endPos);
                hostEditor.setSelection(pos, endPos);

                return {
                    radius: radiusValue,
                    marker: marker
                };
            }
        }
        return null;
        // Adjust pos to the beginning of the match so that the inline editor won't get
        // dismissed while we're updating the border-radius with the new values from user's inline editing
    }

    /**
     * Registered as an inline editor provider: creates an InlineBorderRadiusEditor when the cursor
     * is on a border-radius value (in any flavor of code).
     *
     * @param {!Editor} hostEditor
     * @param {!{line:Number, ch:Number}} pos
     * @return {?$.Promise} synchronously resolved with an InlineWidget, or null if there's
     * no border-radius at pos.
     */
    function inlineBorderRadiusEditorProvider(hostEditor, pos) {
        var context = prepareEditorForProvider(hostEditor, pos),
        inlineBorderRadiusEditor,
            result;

        if (!context) {
            return null;
        } else {
            inlineBorderRadiusEditor = new InlineBorderRadiusEditor(context.radius, context.marker);
            inlineBorderRadiusEditor.load(hostEditor);

            result = new $.Deferred();
            result.resolve(inlineBorderRadiusEditor);
            return result.promise();
        }
    }

    function queryInlineBorderRadiusEditorProvider(hostEditor, pos) {
        var borderRadiusRegEx, cursorLine, match, sel, start, end, endPos, marker;
        var cssPropertyName, semiColonPos, colonPos, borderRadiusValue, cursorLineSubstring, firstCharacterPos;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return false;
        }

        borderRadiusRegEx = new RegExp(BorderRadiusUtils.BORDER_RADIUS_REGEX);
        cursorLine = hostEditor.document.getLine(pos.line);

        // Loop through each match of borderRadiusRegEx and stop when the one that contains pos is found.
        do {
            match = borderRadiusRegEx.exec(cursorLine);
            if (match) {
                start = match.index;
                end = start + match[0].length;
            }
        } while (match && (pos.ch < start || pos.ch > end));

        if (match) {
            return true;
        }

        // Get the css property name after removing spaces and ":" so that we can check for it in the file BorderRadiusProperties.json
        cssPropertyName = cursorLine.split(':')[0].trim();

        if (!cssPropertyName || !properties[cssPropertyName]) {
            return false;
        }

        if (properties[cssPropertyName]) {
            colonPos = cursorLine.indexOf(":");
            semiColonPos = cursorLine.indexOf(";");
            cursorLineSubstring = cursorLine.substring(colonPos + 1, cursorLine.length);
            borderRadiusValue = cursorLineSubstring.replace(/ /g,"").replace(";", "");
            if (borderRadiusValue) {
                return borderRadiusRegEx.test(borderRadiusValue);
            }
            return true;
        }

        return false;
    }

    // Initialize extension
    ExtensionUtils.loadStyleSheet(module, "css/main.less");
    EditorManager.registerInlineEditProvider(inlineBorderRadiusEditorProvider, queryInlineBorderRadiusEditorProvider);
    exports.prepareEditorForProvider = prepareEditorForProvider;
});
