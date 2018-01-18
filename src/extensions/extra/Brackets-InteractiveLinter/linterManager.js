/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var _                  = brackets.getModule("thirdparty/lodash"),
        LanguageManager    = brackets.getModule("language/LanguageManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        preferences        = PreferencesManager.getExtensionPrefs("interactive-linter"),
        linterSettings     = require("linterSettings"),
        linterReporter     = require("linterReporter"),
        linters            = {},
        linterManager      = {},
        registeredLanguage = {};

    // Default delay is 1/2 a second
    preferences.definePreference("delay", "integer", 500);


    function LintRunner(editor) {
        var delay     = preferences.get("delay") || 500;
        this.editor   = editor;
        this.reporter = linterReporter();
        this.lint     = _.debounce(LintRunner.lint.bind(null, this, editor.document.file.fullPath), delay);
    }


    LintRunner.prototype.getLinter = function() {
        var language         = this.editor.document.getLanguage().getId();
        var preferredLinters = preferences.get(language);
        var linterName       = preferredLinters && preferredLinters[0];
        return linters[linterName];
    };


    LintRunner.prototype.canProcess = function() {
        return !!this.getLinter();
    };


    LintRunner.prototype.clear = function() {
        this.reporter.clear();
    };


    /**
     * Interface that will be used for running linters
     */
    LintRunner.lint = function(lintRunner, fullPath) {
        var linterPlugin = lintRunner.getLinter();

        if (!linterPlugin) {
            return;
        }

        // Strip out minified text
        var text = stripMinified(lintRunner.editor.document.getText());

        return linterSettings.loadSettings(linterPlugin.settingsFile, fullPath, lintRunner)
            .always(function(settings) {
                linterPlugin.lint(text, settings)
                    .done(function(result) {
                        lintRunner.reporter.report(lintRunner.editor._codeMirror, result);
                    });
            });
    };


    /**
     * Interface to register documents that need an instance of the appropriate linter.
     *
     * @param {CodeMirror} cm Is the CodeMirror instance to enable interactive linting on.
     * @param {File} file - Is the file for the document being registered.  This is to
     *  load the most suitable settings file.
     *
     * @returns {Linter} Instance of linter to process the cm document
     */
    function createLintRunner(editor) {
        return new LintRunner(editor);
    }

    function registerLinter(linter) {
        linters[linter.name] = linter;

        if (linter.language && !registeredLanguage[linter.language]) {
            registeredLanguage[linter.language] = true;
            preferences.definePreference(linter.language, "array", [linter.name]);
        }
    }


    /**
     * Strips out any line that longer than 250 characters as a way to guess if
     * the code is minified
     */
    function stripMinified(text) {
        // https://regex101.com/r/oE3nP0/2
        if (/function[ ]?\w*\([\w,]*\)\{(?:\S[ \n]?){100,}\}/gm.test(text)) {
            return text.replace(/(?:.){100,}/gm, "");
        }

        return text;
    }


    // Make sure JSX is processed as javascript
    LanguageManager.getLanguage("javascript").addFileName([".jsx"]);

    linterManager.createLintRunner = createLintRunner;
    linterManager.registerLinter   = registerLinter;
    return linterManager;
});
