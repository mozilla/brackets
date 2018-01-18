/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var _                  = brackets.getModule("thirdparty/lodash"),
        EditorManager      = brackets.getModule("editor/EditorManager"),
        CodeInspection     = brackets.getModule("language/CodeInspection"),
        AppInit            = brackets.getModule("utils/AppInit"),
        KeyBindingManager  = brackets.getModule("command/KeyBindingManager"),
        Commands           = brackets.getModule("command/Commands"),
        CommandManager     = brackets.getModule("command/CommandManager"),
        ExtensionUtils     = brackets.getModule("utils/ExtensionUtils"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        preferences        = PreferencesManager.getExtensionPrefs("interactive-linter"),
        linterManager      = require("linterManager"),
        pluginManager      = require("pluginManager");

    require("lintIndicator");
    require("lintPanel");
    require("linterSettings");

    var bracketsLinterEnabled = true;
    var CMD_SHOW_LINE_DETAILS = "MiguelCastillo.interactive-linter.showLineDetails";
    var SHORTCUT_KEY          = "Ctrl-Shift-E";
    var linter;

    ExtensionUtils.loadStyleSheet(module, "style.less");
    KeyBindingManager.addBinding(CMD_SHOW_LINE_DETAILS, SHORTCUT_KEY);
    CommandManager.register("Show Line Details", CMD_SHOW_LINE_DETAILS, handleToggleLineDetails);
    AppInit.appReady(appReady);


    function addGutter(editor) {
        var cm = editor._codeMirror;
        var gutters = cm.getOption("gutters").slice(0);
        if (gutters.indexOf("interactive-linter-gutter") === -1) {
            gutters.unshift("interactive-linter-gutter");
            cm.setOption("gutters", gutters);
        }
    }


    /**
     * Show line details
     */
    function gutterClick(cm, lineIndex, gutterId) {
        if (gutterId === "interactive-linter-gutter") {
            linter.reporter.toggleLineDetails(lineIndex);
        }
    }


    function activateEditor(editor) {
        editor._codeMirror.on("gutterClick", gutterClick);
        editor.on("editorChange", handleDocumentChange);
    }


    function deactivateEditor(editor) {
        editor._codeMirror.off("gutterClick", gutterClick);
        editor.off("editorChange", handleDocumentChange);
    }



    /**
     * Toggles open/close the inline details widget.
     */
    function handleToggleLineDetails() {
        if (linter) {
            linter.reporter.toggleLineDetails();
        }
    }


    /**
     * Function to cause a lint operation
     */
    function handleDocumentChange() {
        if (linter && linter.canProcess()) {
            linter.lint();
            setTimeout(disableBracketsIndicator);
        }
        else {
            linter.clear();
            setTimeout(enableBracketsIndicator);
            $(linterManager).triggerHandler("linterNotFound");
        }
    }


    /**
     * Function to disable the native linter indicator in Brackets.  This is
     * because interactive linter has its own indicator and we don't want any
     * conflicts.
     */
    function disableBracketsIndicator() {
        CodeInspection.toggleEnabled(false, true);

        var command = CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION);
        bracketsLinterEnabled = command.getChecked();
        command.setChecked(false);
        command.setEnabled(false);

        $("#status-inspection").hide();
        $("#interactive-linter-lint-indicator").show();
    }


    /**
     * Function that enables the native linter indicator when interactive
     * linter is not active.
     */
    function enableBracketsIndicator() {
        var command = CommandManager.get(Commands.VIEW_TOGGLE_INSPECTION);
        command.setChecked(bracketsLinterEnabled);
        command.setEnabled(true);

        $("#status-inspection").show();
        $("#interactive-linter-lint-indicator").hide();
        CodeInspection.toggleEnabled(true, true);
    }


    /**
     * Function that gets called when there is a new document that needs
     * interactive linter registered on.
     */
    function setDocument(evt, currentEditor, previousEditor) {
        if (previousEditor) {
            deactivateEditor(previousEditor);
        }

        if (currentEditor) {
            linter = currentEditor.__linter || (currentEditor.__linter = linterManager.createLintRunner(currentEditor));

            // If a linter was successfully created, then we are safe to bind event handlers for editor changes.
            activateEditor(currentEditor);
            addGutter(currentEditor);
            handleDocumentChange();
        }
    }


    /**
     * Function that gets called when Brackets is loaded and ready
     */
    function appReady() {
        // Removes the default Brackets JSLint linter
        CodeInspection.register("javascript", {
            name: "interactive-linter-remove-jslint",
            scanFile: $.noop
        });

        // Load up plugins and wait til they are done loading before we
        // register any handlers into Brackets
        pluginManager().done(function(plugins) {
            for (var iPlugin in plugins) {
                linterManager.registerLinter(plugins[iPlugin]);
            }

            EditorManager.on("activeEditorChange.interactive-linter", setDocument);
            setDocument(null, EditorManager.getActiveEditor());

            // If the linters change, then make sure to rebind the document with the new linter
            var lastLinters;
            preferences.on("change", function() {
                var editor = EditorManager.getActiveEditor();
                if (!editor) {
                    return;
                }

                var language = editor.document.getLanguage().getId();
                var linters  = preferences.get(language);

                if (linters && !_.isEqual(linters, lastLinters)) {
                    lastLinters = linters.slice(0);
                    handleDocumentChange();
                }
            });

        });
    }
});
