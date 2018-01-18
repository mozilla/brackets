/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require /*, exports, module*/) {
    "use strict";

    var _             = brackets.getModule("thirdparty/lodash"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        Promise       = require("libs/js/spromise"),
        ProblemWidget = require("ProblemWidget");


    function Reporter() {
        this.marks = {};
    }


    /**
     * Routine that goes through all the linter messages and adds all the gutter
     * symbols and the underlines.
     *
     * @param messages {Array} linter messages
     * @param cm {CodeMirror} codemirror instance
     */
    Reporter.prototype.report = function(cm, messages) {
        var _self = this;

        this.lastMessages = messages;

        if (this.lastRequest && this.lastRequest.state() === "pending") {
            return;
        }

        this.lastRequest = this._runReport(cm, messages)
            .always(function () {
                _self.lastRequest = null;
                if (_self.lastMessages !== messages) {
                    _self.report(cm, _self.lastMessages);
                }
            });
    };

    /**
     * Add reporting information in code mirror's document
     *
     * Message requires:
     * - type,
     * - code,
     * - raw,
     * - reason,
     * - href
     *
     * Token is a CodeMirror token that specifies start/end information for
     * the string in CodeMirror's document
     */
    Reporter.prototype.addGutterMarks = function(message, token) {
        var mark = this.marks[token.start.line];

        // gutterMark is the placehoder for the lightbulb
        // lineMarks are the underlines in the places the errors are reported for

        if (!mark) {
            mark = {
                warnings: [],
                errors: [],
                lineMarks: [],
                gutterMark: {
                    element: $("<div class='interactive-linter-gutter-messages' title='Click for details'>&nbsp;</div>")
                }
            };

            this.marks[token.start.line] = mark;
            mark.gutterMark.line = this.cm.setGutterMarker(token.start.line, "interactive-linter-gutter", mark.gutterMark.element[0]);
        }

        // Add message to warnings or errors array
        if (mark[message.type + "s"]) {
            mark[message.type + "s"].push(message);
        }

        // If the message is an error message, then add the error class to gutter
        if (message.type === "error") {
            mark.gutterMark.element.addClass("interactive-linter-gutter-errors");
        }
    };


    /**
     * Routine to underline problems in documents
     */
    Reporter.prototype.addLineMarks = function (message, token) {
        var mark  = this.marks[token.start.line];

        // Add line marks
        mark.lineMarks.push({
            line: this.cm.markText(token.start, token.end, {className: "interactive-linter-" + message.type}),
            message: message
        });
    };


    /**
     * Clears all warning/errors from codemirror's document
     */
    Reporter.prototype.clearMarks = function () {
        var _self = this;

        if (!this.cm) {
            return;
        }

        this.cm.clearGutter("interactive-linter-gutter");

        _.forEach(this.marks, function (mark) {
            mark.lineMarks.forEach(function (textMark) {
                textMark.line.clear();
            });

            if (mark.inlineWidget) {
                _self.hideLineDetails(mark.inlineWidget);
                delete mark.inlineWidget;
            }

            delete mark.errors;
            delete mark.warnings;
            delete mark.lineMarks;
            delete mark.gutterMarks;
        });

        this.marks = {};
    };


    Reporter.prototype.getWidgetForLine = function (line) {
        var activeEditor  = EditorManager.getActiveEditor();
        var inlineWidgets = activeEditor.getInlineWidgets();

        return _.find(inlineWidgets, function (widget) {
            return widget instanceof ProblemWidget && widget.line === line;
        });
    };


    Reporter.prototype.toggleLineDetails = function (line) {
        var activeEditor = EditorManager.getActiveEditor();
        var cursorPos    = line === undefined ? activeEditor.getCursorPos() : { line: line, ch: 0 };
        var lineWidget   = this.getWidgetForLine(cursorPos.line);

        if (lineWidget) {
            this.hideLineDetails(lineWidget);
        }
        else {
            this.showLineDetails(line);
        }
    };


    Reporter.prototype.hideLineDetails = function (widget) {
        EditorManager.getActiveEditor().removeInlineWidget(widget);
    };


    Reporter.prototype.showLineDetails = function (line) {
        var activeEditor = EditorManager.getActiveEditor();
        var cursorPos = line !== undefined ? {line: line, ch: 0} : activeEditor.getCursorPos();

        var mark = this.marks[cursorPos.line];

        if (mark) {
            var problemWidget = new ProblemWidget(mark, cursorPos.line);
            problemWidget.load(activeEditor);
            activeEditor.addInlineWidget(cursorPos, problemWidget, true);

            mark.inlineWidget = problemWidget;
        }
    };

    /**
     * Determines if there is a fatal error in the linting report
     */
    Reporter.prototype.checkFatal = function (messages) {
        // If the last message created by linter is falsy, that means
        // that we have encoutered a fatal error...
        if (messages.length > 2 && !messages[messages.length - 1]) {
            $(linterReporter).triggerHandler("fatalError", messages[messages.length - 2]);
            return true;
        }

        this.clearFatalError();
        return false;
    };


    Reporter.prototype.clearFatalError = function () {
        $(linterReporter).triggerHandler("fatalError", null);
    };


    Reporter.prototype._runReport = function (cm, messages) {
        var _self = this;
        var deferred = Promise.defer();


        // Run as operation for best performance
        setTimeout(function () {
            cm.operation(function() {
                _self.clearMarks();

                $(linterReporter).triggerHandler("lintMessage", [messages]);

                if (messages) {
                    _self.checkFatal(messages);
                    _self.cm       = cm;
                    _self.messages = messages;

                    _.forEach(messages, function (message) {
                        if (!message) {
                            return;
                        }

                        if (message.token) {
                            _self.addGutterMarks(message, message.token);
                            _self.addLineMarks(message, message.token);
                        }
                    });
                }

                deferred.resolve();
            });
        }, 0);

        return deferred.promise;
    };


    function linterReporter () {
        var _reporter = new Reporter();

        function report(cm, messages) {
            return _reporter.report(cm, messages);
        }

        function toggleLineDetails(line) {
            _reporter.toggleLineDetails(line);
        }

        function clear() {
            _reporter.clearMarks();
        }

        return {
            clear: clear,
            report: report,
            toggleLineDetails: toggleLineDetails
        };
    }


    return linterReporter;
});
