define(function (require, exports, module) {
    "use strict";

    var BrambleEvents = brackets.getModule("bramble/BrambleEvents");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var CommandManager = brackets.getModule("command/CommandManager");
    var Commands = brackets.getModule("command/Commands");

    var ConsoleManagerRemote = require("text!lib/ConsoleManagerRemote.js");
    var IFrameBrowser = require("lib/iframe-browser");

    var isConsoleEnabled = false;

})
