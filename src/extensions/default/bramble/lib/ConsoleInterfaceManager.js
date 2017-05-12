/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Alexandru Ghiura
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * /

/*jslint vars: true, plusplus: true, nomen: true */
/*global define, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        panelHTML = require("text!htmlContent/console.html"),
        Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        Strings = brackets.getModule("strings");

    var panel,
        showConsoleTab = null,
        livePreviewOnly = false,
        wasClosedByUser = false,
        unreadCount = 0,
        consoleEl = null,
        maxLogs = 30;

    function clear() {
        consoleEl.find(".log-entry").remove();
        unreadCount = 0;
    }

    function showPanel(){
      unreadCount = 0;
      panel.show();
      showConsoleTab.removeClass("has-unseen-logs");
      $("#editor-holder").addClass("console-open");
      panel.$panel.find(".console").animate({ scrollTop: consoleEl[0].scrollHeight }, 10);
    }

    function hidePanel(){
      panel.hide();
      $("#editor-holder").removeClass("console-open");
      panel.$panel.find(".console div").removeClass("new-log");
    }

    function addLine(type, item) {
        var $element = $("<div class='log-entry " + type + "'></div>");

        if(typeof item === "object") {
          item = JSON.stringify(item);
        } else {
            // Force non-strings to show as string.
            item = "" + item;
        }

        if(!item.length) {
          item = Strings.CONSOLE_EMPTY_STRING;
          $element.addClass("empty-string");
        }

        $element.text(item);

        if(panel.isVisible()) {
          $element.addClass("new-log");
        }

        consoleEl.append($element);

        var logCount = consoleEl.find("div").length;
        if(logCount > maxLogs) {
          consoleEl.find(":first-child").remove();
        }

        consoleEl.animate({ scrollTop: consoleEl[0].scrollHeight }, 10);
    }

    function add(type, args) {
        // Display the console when user code triggers console.* functions,
        // but only if the console was not already closed by the user.
        if(!panel.isVisible() && !wasClosedByUser) {
            showPanel();
        }

        if(!panel.isVisible()) {
          unreadCount++;
        }

        if(unreadCount > 0) {
          showConsoleTab.removeClass("has-unseen-logs").width(showConsoleTab.width());
          showConsoleTab.addClass("has-unseen-logs");
        }

        args.forEach(function(arg) {
            addLine(type, arg);
        });
    }

    function togglePanel() {
        if (panel.isVisible()) {
            hidePanel();
        } else {
            showPanel();
            wasClosedByUser = false;
        }
    }

    AppInit.htmlReady(function () {
        ExtensionUtils.loadStyleSheet(module, "../stylesheets/consoleTheme.less");

        // Localization & Creation of HTMl Elements
        panelHTML = Mustache.render(panelHTML, Strings);
        panel = WorkspaceManager.createBottomPanel("console.panel", $(panelHTML));

        var iconString = "<div class=\"show-console-tab\" title='{{CONSOLE_TOOLTIP}}'></div>";
        showConsoleTab = $(Mustache.render(iconString, Strings));
        showConsoleTab.appendTo($("#editor-holder"));

        consoleEl = panel.$panel.find(".console");

        panel.$panel.find("#clearConsole").on("click", function () {
            clear();
        });

        panel.$panel.find(".close").on("click", function () {
            hidePanel();
            wasClosedByUser = true;
        });

        showConsoleTab.on("click", togglePanel);
    });

    exports.add = add;
});
