/*
 * The MIT License (MIT)
 * Copyright (c) 2012-2015 Dennis Kehrig. All rights reserved.
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

/*jslint vars: true, plusplus: true, devel: true, regexp: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    "use strict";
    
    
    // --- Required modules ---

    var _                  = brackets.getModule("thirdparty/lodash"),
        AppInit            = brackets.getModule("utils/AppInit"),
        CommandManager     = brackets.getModule("command/CommandManager"),
        EditorManager      = brackets.getModule("editor/EditorManager"),
        ExtensionUtils     = brackets.getModule("utils/ExtensionUtils"),
        Menus              = brackets.getModule("command/Menus"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        stylesTemplate     = require("text!styles/whitespace-colors-css.tmpl"),
        Strings            = require("strings");

    
    // --- Settings ---
    
    var commandID          = "denniskehrig.ShowWhitespace.toggle";
    var preferencesID      = "denniskehrig.ShowWhitespace";
    var defaultPreferences = {
        enabled: false,
        colors: {
            "light": {
                "empty": "#ccc",
                "leading": "#ccc",
                "trailing": "#ff0000",
                "whitespace": "#ccc"
            },
            "dark": {
                "empty": "#686963",
                "leading": "#686963",
                "trailing": "#ff0000",
                "whitespace": "#686963"
            }
        }
    };

    
    // --- State Variables ---
    
    var _preferences,
        _command,
        _styleTag,
        _styleInline,
        _styleInlineTemplate;

    
    // --- Functionality ---

    /**
     * Create a new overlay mode that encapsulates its own state in a closure.
     * Such a mode can only be used once at a time because the shared state would create conflicts otherwise.
     */
    function _makeOverlay() {
        // States for the overlay mode, which is supposed to be stateless and so can't use the state functionality provided by CodeMirror
        var _appendSpace    = false,
            _isLeading      = true,
            _isTrailing     = false,
            _isEmptyLine    = false,
            _trailingOffset = null;
        
        return {
            token: function (stream, state) {
                var ch,
                    trailing,
                    ateCode     = false,
                    tokenStyle  = "";
                
                // Start of line: reset state
                if (stream.sol()) {
                    _isLeading  = true;
                    _isTrailing = false;
                    _isEmptyLine = false;
                    
                    _trailingOffset = stream.string.length;
                    trailing = stream.string.match(/[ \t\u00A0]+$/);
                    if (trailing) {
                        _trailingOffset -= trailing[0].length;
                        // Everything is whitespace
                        if (_trailingOffset === 0) {
                            _isEmptyLine = true;
                        }
                    }
                }
                
                // Peek ahead one character at a time
                // Wrapping the assignment in a Boolean makes JSLint happy
                while (Boolean(ch = stream.peek())) {
                    if (ch === " " || ch === "\t" || ch === "\xA0") {
                        if (ateCode) {
                            // Return now to mark all code seen so far as not necessary to highlight
                            return null;
                        }
                        // Eat the whitespace
                        stream.next();
                        
                        // Test if this is a trailing whitespace
                        if (!_isLeading && !_isTrailing) {
                            _isTrailing = stream.pos >= _trailingOffset;
                        }
                        
                        // CodeMirror merges consecutive tokens with the same style
                        // There's a setting called "flattenSpans" to prevent that, but it's for the whole editor*
                        // So instead we simply append a space character to the style every other time
                        // This disables CodeMirror's string comparison while having no effect on the CSS class
                        // *changed in https://github.com/marijnh/CodeMirror/commit/221a1e4070d503f4597f7823e4f2cf68ba884cdf
                        _appendSpace = !_appendSpace;
                        
                        tokenStyle  += "dk-whitespace-";
                        tokenStyle  += (_isEmptyLine ? "empty-line-" : (_isLeading ? "leading-" : (_isTrailing ? "trailing-" : "")));
                        tokenStyle  += (ch === " " ? "space" : (ch === "\xA0" ? "nonbrk-space" : "tab"));
                        tokenStyle  += (_appendSpace ? " " : "");
                        
                        return tokenStyle;
                    } else {
                        stream.next();
                        ateCode     = true;
                        _isLeading  = false;
                    }
                }
                return null;
            }
        };
    }
    
    /**
     * Apply the whitespace colors.
     * This does NOT overwrite styles already defined by a theme.
     */
    function _applyColors() {
        _styleInline.text(_styleInlineTemplate(_preferences.get("colors")));
    }

    function updateOverlay(editor) {
        var codeMirror = editor._codeMirror;
        if (!codeMirror) { return; }
        
        var showWhitespace = _command.getChecked();
        
        if (!showWhitespace && codeMirror._dkShowWhitespaceOverlay) {
            codeMirror.removeOverlay(codeMirror._dkShowWhitespaceOverlay);
            delete codeMirror._dkShowWhitespaceOverlay;
        }
        
        if (showWhitespace && !codeMirror._dkShowWhitespaceOverlay) {
            codeMirror._dkShowWhitespaceOverlay = _makeOverlay();
            codeMirror.addOverlay(codeMirror._dkShowWhitespaceOverlay);
        }
    }
    
    function updateEditors(includeEditor) {
        var fullEditor = EditorManager.getCurrentFullEditor();
        if (!fullEditor) { return; }
        
        var editors = [fullEditor].concat(EditorManager.getInlineEditors(fullEditor));
        
        // activeEditorChange fires before a just opened inline editor would be listed by getInlineEditors
        // So we include it manually
        if (includeEditor && editors.indexOf(includeEditor) === -1) {
            editors.push(includeEditor);
        }
        
        editors.forEach(updateOverlay);
    }
    
    // --- Event Handlers ---

    function onCommandExecuted() {
        if (!_command.getChecked()) {
            _command.setChecked(true);
        } else {
            _command.setChecked(false);
        }
    }

    function onCheckedStateChange() {
        _preferences.set("enabled", _command.getChecked());
        _preferences.set("colors", _preferences.get("colors"));
        _preferences.save();
        updateEditors();
    }
    
    function onActiveEditorChange(e, editor) {
        updateEditors(editor);
    }

    function updateColors(e, data) {
        if (data.ids.indexOf("theme") > -1 || data.ids.indexOf("colors") > -1) {
            _applyColors();
        }
    }

    
    // --- Loaders and Unloaders ---

    function loadPreferences() {
        _preferences = PreferencesManager.getExtensionPrefs(preferencesID);
        _preferences.definePreference("enabled", "boolean", defaultPreferences.enabled);
        _preferences.definePreference("colors", "Object", defaultPreferences.colors);
    }
  
    function loadPrefListeners() {
        _preferences.on("change", function (e, data) {
            _command.setChecked(_preferences.get("enabled"));
            updateColors(e, data);
        });
        PreferencesManager.getExtensionPrefs("themes").on("change", updateColors);
    }
  
    function unloadPrefListeners() {
        _preferences.off("change", updateColors);
        PreferencesManager.getExtensionPrefs("themes").off("change", updateColors);
    }


    function loadStyle() {
        ExtensionUtils.loadStyleSheet(module, "styles/main.css").done(function (node) {
            _styleTag = node;
        });
        _styleInline = $(ExtensionUtils.addEmbeddedStyleSheet(""));
        _styleInlineTemplate = _.template(stylesTemplate);
        _applyColors();
    }

    function unloadStyle() {
        $(_styleTag).remove();
    }

    
    function loadCommand() {
        _command = CommandManager.get(commandID);
        
        if (!_command) {
            _command = CommandManager.register(Strings.CMD_TOGGLE, commandID, onCommandExecuted);
        } else {
            CommandManager.execute(commandID);
        }

        _command.on("checkedStateChange", onCheckedStateChange);
        
        // Enable/disable extension based on user preference
        _command.setChecked(_preferences.get("enabled"));
    }

    function unloadCommand() {
        _command.setChecked(false);
        _command.off("checkedStateChange", onCheckedStateChange);
        _command._commandFn = null;
    }
    
    
    function loadEditorSync() {
        EditorManager.on("activeEditorChange", onActiveEditorChange);
    }

    function unloadEditorSync() {
        EditorManager.off("activeEditorChange", onActiveEditorChange);
    }

    
    // Setup the UI
    function load() {
        loadPreferences();
        loadStyle();
        loadPrefListeners();
        loadCommand();
        loadEditorSync();
    }

    // Tear down the UI
    function unload() {
        unloadEditorSync();
        unloadCommand();
        unloadStyle();
        unloadPrefListeners();
    }

    AppInit.appReady(load);
});
