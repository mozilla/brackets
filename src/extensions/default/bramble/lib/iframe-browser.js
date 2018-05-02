/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */
define(function (require, exports, module) {
    "use strict";

    var CommandManager      = brackets.getModule("command/CommandManager"),
        MainViewManager     = brackets.getModule("view/MainViewManager"),
        Commands            = brackets.getModule("command/Commands"),
        Resizer             = brackets.getModule("utils/Resizer"),
        StatusBar           = brackets.getModule("widgets/StatusBar");
    // Orientation
    var VERTICAL_ORIENTATION    = 0,
        HORIZONTAL_ORIENTATION  = 1;
    // by default we use vertical orientation
    var _orientation = VERTICAL_ORIENTATION;
    // Window object reference
    var detachedWindow;
    var isReload;
    var PostMessageTransport = require("lib/PostMessageTransport");
    var Compatibility = require("lib/compatibility");

    /*
     * Publicly avaialble function used to create an empty iframe within the second-panel
     */
    function init() {
        //Check to see if we've created the iframe already, return if so
        if(getBrowserIframe()) {
            return;
        }
        //Get current GUI layout
        var result = MainViewManager.getLayoutScheme();

        // If iframe does not exist, then show it
        if(result.rows === 1 && result.columns === 1) {
            setLayout();
        }
        /*
         *Creating the empty iFrame we'll be using
         * Starting by Emptying all contents of #second-pane
         */
        var _panel = $("#second-pane").empty();

        // Create the iFrame for the blob to live in later
        var iframeConfig = {
            id: "bramble-iframe-browser",
            frameborder: 0
        };
        //Append iFrame to _panel
        $("<iframe>", iframeConfig).addClass("iframeWidthHeight").prop("allow", "geolocation *; microphone *; camera *").appendTo(_panel);
    }

    /*
     * Publicly available function used to change the _orientation value of iframe-browser
     * orientation: Takes one argument of either VERTICAL_ORIENTATION OR
     * HORIZONTAL_ORIENTATION and uses that to change the _orientation value accordingly
     */
    function setOrientation(orientation) {
        if(orientation === VERTICAL_ORIENTATION) {
            _orientation = VERTICAL_ORIENTATION;
        }
        else if (orientation === HORIZONTAL_ORIENTATION) {
            _orientation = HORIZONTAL_ORIENTATION;
        }
    }

    /*
     * Publicly available function used to change the layout of the iFrame
     * orientation: Takes one argument of either VERTICAL_ORIENTATION OR
     * HORIZONTAL_ORIENTATION and uses that to change the layout accordingly
     */
    function setLayout() {
        if(_orientation === VERTICAL_ORIENTATION) {
            CommandManager.execute(Commands.CMD_SPLITVIEW_VERTICAL);
        }
        else if(_orientation === HORIZONTAL_ORIENTATION) {
            CommandManager.execute(Commands.CMD_SPLITVIEW_HORIZONTAL);
        }

        // SplitView will focus new pane, put it back on first editor pane
        MainViewManager.setActivePaneId("first-pane");
    }

    /**
     * Function used to interact with the second-pane,
     * In which our iFrame will exists, and the detached
     * preview, if it exist. They will be filled
     * with the url (or raw HTML) that has been passed to this function
     */
    function update(urlOrHTML) {
        if(!urlOrHTML) {
            return;
        }

        var iframe = getBrowserIframe();
        var doc;

        Compatibility.supportsIFrameHTMLBlobURL(function(err, shouldUseBlobURL) {
            if(err) {
                console.error("[Brackets IFrame-Browser] Unexpected error:", err);
                return;
            }

            if(iframe) {
                if(shouldUseBlobURL) {
                    iframe.src = urlOrHTML;
                } else {
                    doc = iframe.contentWindow.document.open("text/html", "replace");
                    doc.write(urlOrHTML);
                    doc.close();
                }
            }
        });
    }

    // Return reference to iframe element or null if not available.
    function getBrowserIframe() {
        return window.document.getElementById("bramble-iframe-browser");
    }

    /**
     * Used to hide second pane, spawn detached preview, and attach beforeunload listener
     */
    function hide() {
        Resizer.hide("#second-pane");
        $("#first-pane").addClass("expandEditor");
    }

    /**
     * Used to show second pane, change lilveDevButton background and close the detached preview
     */
    function show() {
        Resizer.show("#second-pane");
        $("#first-pane").removeClass("expandEditor");
    }

    // Define public API
    exports.init = init;
    exports.update = update;
    exports.setLayout = setLayout;
    exports.getBrowserIframe = getBrowserIframe;
    // Expose these constants on our module, so callers can use them with setOrientation()
    exports.HORIZONTAL_ORIENTATION = HORIZONTAL_ORIENTATION;
    exports.VERTICAL_ORIENTATION = VERTICAL_ORIENTATION;
    exports.setOrientation = setOrientation;
    exports.show = show;
    exports.hide = hide;
});
