/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var EditorManager    = brackets.getModule("editor/EditorManager"),
        MainViewManager  = brackets.getModule("view/MainViewManager"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        Resizer          = brackets.getModule("utils/Resizer"),
        StringUtils      = brackets.getModule("utils/StringUtils"),
        Mustache         = brackets.getModule("thirdparty/mustache/mustache"),
        linterManager    = require("linterManager"),
        linterReporter   = require("linterReporter"),
        panelTemplate    = require("text!templates/problemsPanel.html"),
        resultsTemplate  = require("text!templates/problemsPanelTable.html"),
        collapsed        = true,
        hasErrors        = false;

    var $problemsPanel, $problemsPanelTable;


    function handleIndicatorClick() {
        if (!hasErrors) {
            hidePanel();
        }
        else {
            if (Resizer.isVisible($problemsPanel)) {
                collapsed = true;
                hidePanel();
            }
            else {
                collapsed = false;
                showPanel();
            }
        }
    }


    function showPanel() {
        if (hasErrors) {
            Resizer.show($problemsPanel);
        }
    }


    function hidePanel() {
        Resizer.hide($problemsPanel);
    }


    function createPanel() {
        var $panelHtml = $(Mustache.render(panelTemplate));
        WorkspaceManager.createBottomPanel("interactive-linter.linting.messages", $panelHtml, 100);

        $problemsPanel = $("#interactive-linter-problems-panel");
        $problemsPanel.on("click", ".close", function () {
            collapsed = true;
            hidePanel();
        });

        $problemsPanelTable = $problemsPanel.find(".table-container");
        $problemsPanelTable.on("click", "tr", function () {
            var $target = $(this);
            var line = $target.data("line"); // Convert from friendly line to actual line number
            var ch   = $target.data("character");
            
            // if there is no line number available, don't do anything
            if (!isNaN(line) && !isNaN(ch)) {
                line -= 1;
                ch -= 1;
                var editor    = EditorManager.getCurrentFullEditor();
                editor.setCursorPos(line, ch, true);
                MainViewManager.focusActivePane();
            }
        });
    }


    function updateTitle(numProblems) {
        var isPlural = numProblems !== 1;
        var message = StringUtils.format("Interactive Linter: {0} Linter Problem{1}", numProblems, isPlural ? "s" : "");
        $problemsPanel.find(".title").text(message);
    }

    function handleMessages(messages) {
        if (messages) {
            hasErrors = true;
            var html = Mustache.render(resultsTemplate, {messages: messages});

            $problemsPanelTable
                .empty()
                .append($(html))
                .scrollTop(0);

            if (!collapsed) {
                showPanel();
            }

            updateTitle(messages.length);
        }
        else {
            hasErrors = false;
            hidePanel();
        }
    }

    $(linterReporter).on("lintMessage", function (evt, messages) {
        handleMessages(messages);
    });

    $(linterManager).on("linterNotFound", function () {
        hasErrors = false;
        hidePanel();
    });

    createPanel();

    $(document).on("click", "#interactive-linter-lint-indicator", function () {
        handleIndicatorClick();
    });
});
