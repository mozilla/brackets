define(function (require, exports, module) {
    "use strict";

    var BrambleEvents = brackets.getModule("bramble/BrambleEvents");
    var TouchEmulatorRemote = require("text!lib/TouchEmulatorRemote.js");
    var IframeBrowser = require("lib/iframe-browser");

    var iframe;
    var doc;
    

    // Override the preview document's cursor property
    function setIframe(value) {
        
        iframe = IframeBrowser.getBrowserIframe();
        if(!iframe) {
            return;
        }

        doc = iframe.contentDocument || iframe.contentWindow.document;
        if(!doc) {
            return;
        }
    }
      
    function isEnableRequest(msg) {
         return msg.match(/^touch-start/);
    }

    function isDisableRequest(msg) {
         return msg.match(/^touch-stop/);
    }

    function enableTouchEmulator(){
        BrambleEvents.triggerTouchEmulatorChange(true);
    }

    function disableTouchEmulator(){
        BrambleEvents.triggerTouchEmulatorChange(false);
    }
    
    function getRemoteScript(filename) {
        filename = filename || "unknown";

        // Track scroll position per filename, so you can be at different points in each doc
        return "<script>window.___brambleFilename = '" + filename + "';</script>\n" +
               "<script>\n" + TouchEmulatorRemote + "</script>\n";
    }

    exports.enableTouchEmulator   = enableTouchEmulator;
    exports.disableTouchEmulator  = disableTouchEmulator;
    exports.getRemoteScript       = getRemoteScript;
    exports.isEnableRequest       = isEnableRequest;
    exports.isDisableRequest      = isDisableRequest;
      
});
