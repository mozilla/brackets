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

    var EditorManager         = brackets.getModule("editor/EditorManager"),
        ExtensionUtils        = brackets.getModule("utils/ExtensionUtils"),
        InlineBoxModelEditor  = require("InlineBoxModelEditor").InlineBoxModelEditor,
        properties            = JSON.parse(require("text!BoxModelProperties.json")),
        BoxModelUtils         = require("BoxModelUtils"),
        InlineWidget          = brackets.getModule("editor/InlineWidget").InlineWidget;
 
    var DEFAULT_BOXMODEL = "15px";
    /**
     * editor context if so; otherwise null.
     *
     * @param {Editor} hostEditor
     * @param {{line:Number, ch:Number}} pos
     * @return {?{BoxModelValue:String, marker:TextMarker}}
     */
    function prepareEditorForProvider(hostEditor, pos) {
        var BoxModelRegEx, BoxModelValueRegEx, cursorLine, match, sel, start, end, endPos, marker;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return null;
        }

        BoxModelRegEx = new RegExp(BoxModelUtils.BOXMODEL_REGEX);
        BoxModelValueRegEx = new RegExp(BoxModelUtils.BOXMODEL_VALUE_REGEX);
        cursorLine = hostEditor.document.getLine(pos.line);

        // Loop through each match of BoxModelRegEx and stop when the one that contains pos is found.
        do {
            match = BoxModelRegEx.exec(cursorLine);
            if (match) {
                start = match.index;
                end = start + match[0].length;
            }
        } while (match && (pos.ch < start || pos.ch > end));

        if(match){
            // Check if the cursorLine has a CSS rule of type BoxModel
            var type, cssPropertyName, semiColonPos, colonPos, BoxModelValue, cursorLineSubstring, firstCharacterPos, iconClassName;

            // Get the css property name after removing spaces and ":" so that we can check for it in the file BoxModelProperties.json
            cssPropertyName = cursorLine.split(':')[0].trim();

            if(cssPropertyName === "margin") {
                type = "margin";
                iconClassName = "margin-side-icon";
            }
            else {
                type = "padding";
                iconClassName = "side-icon";
            }

            if (!cssPropertyName || !properties[cssPropertyName]) {
                return null;
            }

            if (properties[cssPropertyName]) {
                colonPos = cursorLine.indexOf(":");
                semiColonPos = cursorLine.indexOf(";");
                cursorLineSubstring = cursorLine.substring(colonPos + 1, cursorLine.length);
                BoxModelValue = cursorLineSubstring.replace(/ /g,"").replace(";", "");
                if (BoxModelValue) {
                    if (BoxModelValueRegEx.test(BoxModelValue)) {
                        // edit the BoxModel value of an existing css rule
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
                    // edit the BoxModel value of a new css rule
                    var newText = " ", from, to;
                    newText = newText.concat(DEFAULT_BOXMODEL, ";");
                    from = {line: pos.line, ch: colonPos + 1};
                    to = {line: pos.line, ch: cursorLine.length};
                    hostEditor._codeMirror.replaceRange(newText, from, to);
                    pos.ch = colonPos + 2;
                    endPos = {line: pos.line, ch: pos.ch + DEFAULT_BOXMODEL.length};
                    BoxModelValue = DEFAULT_BOXMODEL;
                }

                marker = hostEditor._codeMirror.markText(pos, endPos);
                hostEditor.setSelection(pos, endPos);

                return {
                    BoxModel: BoxModelValue,
                    marker: marker,
                    type: type,
                    iconClassName: iconClassName
                };
            }
        }
        return null;
    }

    /**
     * Registered as an inline editor provider: creates an InlineBoxModelEditor when the cursor
     * is on a BoxModel value (in any flavor of code).
     *
     * @param {!Editor} hostEditor
     * @param {!{line:Number, ch:Number}} pos
     * @return {?$.Promise} synchronously resolved with an InlineWidget, or null if there's
     * no BoxModel at pos.
     */
    function inlineBoxModelEditorProvider(hostEditor, pos) {
        var context = prepareEditorForProvider(hostEditor, pos),
        inlineBoxModelEditor,
            result;

        if (!context) {
            return null;
        } else {
            inlineBoxModelEditor = new InlineBoxModelEditor(context.BoxModel, context.marker, context.type, context.iconClassName);
            inlineBoxModelEditor.load(hostEditor);

            result = new $.Deferred();
            result.resolve(inlineBoxModelEditor);
            return result.promise();
        }
    }

    function queryInlineBoxModelEditorProvider(hostEditor, pos) {
        var BoxModelRegEx, cursorLine, match, sel, start, end, endPos, marker;
        var cssPropertyName, semiColonPos, colonPos, BoxModelValue, cursorLineSubstring, firstCharacterPos;

        sel = hostEditor.getSelection();
        if (sel.start.line !== sel.end.line) {
            return false;
        }

        BoxModelRegEx = new RegExp(BoxModelUtils.BOXMODEL_REGEX);
        cursorLine = hostEditor.document.getLine(pos.line);

        // Loop through each match of BoxModelRegEx and stop when the one that contains pos is found.
        do {
            match = BoxModelRegEx.exec(cursorLine);
            if (match) {
                start = match.index;
                end = start + match[0].length;
            }
        } while (match && (pos.ch < start || pos.ch > end));

        if (match) {
            return true;
        }

        // Get the css property name after removing spaces and ":" so that we can check for it in the file BoxModelProperties.json
        cssPropertyName = cursorLine.split(':')[0].trim();

        if (!cssPropertyName || !properties[cssPropertyName]) {
            return false;
        }

        if (properties[cssPropertyName]) {
            colonPos = cursorLine.indexOf(":");
            semiColonPos = cursorLine.indexOf(";");
            cursorLineSubstring = cursorLine.substring(colonPos + 1, cursorLine.length);
            BoxModelValue = cursorLineSubstring.replace(/ /g,"").replace(";", "");
            if (BoxModelValue) {
                return BoxModelRegEx.test(BoxModelValue);
            }
            return true;
        }

        return false;
    }

    // Initialize extension
    ExtensionUtils.loadStyleSheet(module, "css/main.less");
    EditorManager.registerInlineEditProvider(inlineBoxModelEditorProvider, queryInlineBoxModelEditorProvider);
    exports.prepareEditorForProvider = prepareEditorForProvider;
    exports.inlineBoxModelProvider = inlineBoxModelEditorProvider;
});

