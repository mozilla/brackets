/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets*/

define(function (require, exports, module) {
    "use strict";

    var AppInit               = brackets.getModule("utils/AppInit"),
        EditorManager         = brackets.getModule("editor/EditorManager"),
        ExtensionUtils        = brackets.getModule("utils/ExtensionUtils"),
        MainViewManager       = brackets.getModule("view/MainViewManager"),
        ContextSensitiveHelp  = require("context-sensitive-help"),
        Help 				  = require("help"),
        Relocator			  = require("relocator"),
        HelpMsgTemplate		  = require("text!help-msg.html");

    AppInit.appReady(function(){

    	var helpArea = $("<div class='help hidden'></div>").appendTo("#first-pane");
        var codeMirror = EditorManager.getActiveEditor()._codeMirror;
        var relocator = Relocator(codeMirror);

        var contextSensitiveHelp = ContextSensitiveHelp({
								  codeMirror: codeMirror,
								  helpIndex: Help.Index(),
								  template: HelpMsgTemplate,
								  helpArea: helpArea,
								  relocator: relocator
								});
    });
});
