/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets */

define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager");
    var EditorManager  = brackets.getModule("editor/EditorManager");
    var MainViewManager = brackets.getModule("view/MainViewManager");

    var CMD_ADD_CODE_SNIPPET_ID     = "bramble.addCodeSnippet";

    /* Example Snippet */
    /*var snippet =
    '<p> Hello World </p>'*/

    function init() {
        /**
         * Inserts a code snippet into the editor.
         * @param {string} snippet The snippet to insert.
         */
        function addCodeSnippet(snippet) {
            MainViewManager.focusActivePane();
            var editor = EditorManager.getActiveEditor();
            if (editor) {
                var insertionPos = editor.getCursorPos();
                // We pass `paste` as the last parameter to `replaceRange` so
                // as to trigger a codemirror change event from origin `paste`
                // which in turn triggers the brackets-paste-and-indent
                // extension to indent this code
                editor.document.replaceRange(snippet, insertionPos, null, "paste");
            }
        }

        CommandManager.registerInternal(CMD_ADD_CODE_SNIPPET_ID, addCodeSnippet);
    }

    exports.init = init;
});

