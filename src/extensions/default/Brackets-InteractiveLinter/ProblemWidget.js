/**
 * Interactive Linter Copyright (c) 2015 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var _              = brackets.getModule("thirdparty/lodash");
    var Mustache       = brackets.getModule("thirdparty/mustache/mustache");
    var InlineWidget   = brackets.getModule("editor/InlineWidget").InlineWidget;
    var widgetTemplate = require("text!templates/inlineWidgetLint.html");

    function ProblemWidget(mark, line) {
        InlineWidget.call(this);

        var problems     = [].concat(mark.warnings, mark.errors);
        var $html        = $(Mustache.render(widgetTemplate, { messages: problems }));
        this.$wrapperDiv = $html;

        this.$wrapperDiv
            .appendTo(this.$htmlContent)
            .on("mousedown", function (e) {
                e.stopPropagation();
            });

        this.line = line;
        this._sizeEditorToContent = _.debounce(sizeEditorToContent.bind(this), 250);
    }


    ProblemWidget.prototype = Object.create(InlineWidget.prototype);
    ProblemWidget.prototype.constructor = ProblemWidget;

    ProblemWidget.prototype.onAdded = function() {
        InlineWidget.prototype.onAdded.apply(this, arguments);

        // Set height initially, and again whenever width might have changed (word wrap)
        this._sizeEditorToContent();
        $(window).on("resize", this._sizeEditorToContent);
    };

    ProblemWidget.prototype.onClosed = function() {
        InlineWidget.prototype.onClosed.apply(this, arguments);
        $(window).off("resize", this._sizeEditorToContent);
    };

    ProblemWidget.prototype.refresh = function() {
        this._sizeEditorToContent();
    };

    function sizeEditorToContent () {
        this.hostEditor.setInlineWidgetHeight(this, this.$wrapperDiv.height() + 20, true);
    }

    module.exports = ProblemWidget;
});
