/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets: true, $*/

define(function (require, exports, module) {
    "use strict";

    var Menus               = brackets.getModule("command/Menus"),
        Resizer             = brackets.getModule("utils/Resizer"),
        UrlParams           = brackets.getModule("utils/UrlParams").UrlParams,
        StatusBar           = brackets.getModule("widgets/StatusBar"),
        MainViewManager     = brackets.getModule("view/MainViewManager"),
        BrambleEvents       = brackets.getModule("bramble/BrambleEvents"),
        BrambleStartupState = brackets.getModule("bramble/StartupState"),
        FileSystem          = brackets.getModule("filesystem/FileSystem"),
        ViewCommandHandlers = brackets.getModule("view/ViewCommandHandlers"),
        SidebarView         = brackets.getModule("project/SidebarView"),
        WorkspaceManager    = brackets.getModule("view/WorkspaceManager"),
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager");

    var PhonePreview  = require("text!lib/Mobile.html");
    var PostMessageTransport = require("lib/PostMessageTransport");

    var isMobileViewOpen = false;

    /**
     * This function calls all the hide functions and listens
     * for bramble to be loaded
     */
    function initUI(callback) {
        // Check to see if there is more than 1 file in the project folder
        var root = BrambleStartupState.project("root");
        FileSystem.getDirectoryForPath(root).getContents(function(err, contents) {
            if(err) {
                return callback(err);
            }

            if(shouldHideUI()) {
                removeTitleBar();
                removeMainToolBar();
                removeLeftSideToolBar();
                removeRightSideToolBar();
                removeStatusBar();

                // If there's only 1 file in the project, hide the sidebar
                if(contents && contents.length === 1) {
                    SidebarView.hide();
                }
            }

            // Restore any UI defaults cached in the client
            restoreState();

            // Show the editor, remove spinner
            $("#spinner-container").remove();
            $("#main-view").css("visibility", "visible");

            callback();
        });
    }

    /**
     * Restores user state sent from the hosting app
     */
    function restoreState() {
        var previewMode = BrambleStartupState.ui("previewMode");
        if(previewMode) {
            switch(previewMode) {
            case "desktop":
                showDesktopView(true);
                break;
            case "mobile":
                showMobileView(true);
                break;
            default:
                console.warn("[Bramble] unknown preview mode: `" + previewMode + "`");
            }
        }

        var wordWrap = BrambleStartupState.ui("wordWrap");
        if(typeof wordWrap === "boolean") {
            PreferencesManager.set("wordWrap", wordWrap);
        }

        var autoCloseTags = BrambleStartupState.ui("autoCloseTags") || { whenOpening: true, whenClosing: true, indentTags: [] };
        PreferencesManager.set("closeTags", autoCloseTags);

        var openSVGasXML = BrambleStartupState.ui("openSVGasXML");
        if(typeof openSVGasXML === "boolean") {
            PreferencesManager.set("openSVGasXML", openSVGasXML);
        }

        var allowJavaScript = BrambleStartupState.ui("allowJavaScript");
        if(typeof allowJavaScript === "boolean") {
            PreferencesManager.set("allowJavaScript", allowJavaScript);
        }

        var allowWhiteSpace = BrambleStartupState.ui("allowWhiteSpace");
        if(typeof allowWhiteSpace === "boolean") {
            PreferencesManager.getExtensionPrefs("denniskehrig.ShowWhitespace").set("enabled", allowWhiteSpace);
        }

        var allowAutocomplete = BrambleStartupState.ui("allowAutocomplete");
        if(typeof allowAutocomplete === "boolean") {
            PreferencesManager.set("codehint.AttrHints", allowAutocomplete);
            PreferencesManager.set("codehint.TagHints", allowAutocomplete);
            PreferencesManager.set("codehint.JSHints", allowAutocomplete);
            PreferencesManager.set("codehint.CssPropHints", allowAutocomplete);
        }

        var autoUpdate = BrambleStartupState.ui("autoUpdate");
        if(typeof autoUpdate === "boolean") {
            PreferencesManager.set("autoUpdate", autoUpdate);
        }

        var sidebarWidth = BrambleStartupState.ui("sidebarWidth");
        if(sidebarWidth) {
            SidebarView.resize(sidebarWidth);
        }

        var sidebarVisible = BrambleStartupState.ui("sidebarVisible");
        if(sidebarVisible !== null) {
            if(sidebarVisible) {
                SidebarView.show();
            } else {
                SidebarView.hide();
            }
        }

        var secondPaneWidth = BrambleStartupState.ui("secondPaneWidth");
        var firstPaneWidth = BrambleStartupState.ui("firstPaneWidth");

        firstPaneWidth = firstPaneWidth * 100 / (
                         ((firstPaneWidth)? firstPaneWidth : 0) +
                         ((secondPaneWidth)? secondPaneWidth : 0)); // calculate width in %

        if(firstPaneWidth) {
            $("#first-pane").width((firstPaneWidth + "%"));
        }


        var fontSize = BrambleStartupState.ui("fontSize");
        if(fontSize && /\d+px/.test(fontSize)) {
            ViewCommandHandlers.setFontSize(fontSize);
        }

        // I'm not 100% sure this is needed, but we're messing with the elements
        // so I suspect we want to sync code that manages them.
        WorkspaceManager.recomputeLayout(true);
    }

    /**
     * This function parses brackets URL, and looks for the GET parameter "ui"
     * if ui is set to 1, then the UI is shown
     */
    function shouldHideUI() {
        var params = new UrlParams();
        params.parse();
        return params.get("ui") !== "1";
    }

    /**
     * By default we disable/hide the StatusBar
     */
    function removeStatusBar() {
        StatusBar.disable();
    }

    /**
     * This function merely removes the left side tool bar
     */
    function removeLeftSideToolBar() {
        //Hide second pane working set list
        $("#working-set-list-second-pane").addClass("hideLeftToolbar");
        //Remove splitview button
        $("#sidebar .working-set-splitview-btn").remove();
    }

    /**
     * This function merely removes the title bar
     * and the header of the first pane
     */
    function removeTitleBar() {
        $("#titlebar").remove();
        $("#first-pane .pane-header").remove();
        //Alter the height of the affected elements
        $("#editor-holder").addClass("editor-holder-height");
        $("#first-pane .pane-content, .cm-s-light-theme").addClass("first-pane-height");
    }

    /**
     * Used to remove the top tool bar
     */
    function removeMainToolBar() {
        //remove the file menu
        Menus.removeMenu(Menus.AppMenuBar.FILE_MENU);

        //remove the edit menu
        Menus.removeMenu(Menus.AppMenuBar.EDIT_MENU);

        //remove the find menu
        Menus.removeMenu(Menus.AppMenuBar.FIND_MENU);

        //remove the view menu
        Menus.removeMenu(Menus.AppMenuBar.VIEW_MENU);

        //remove the navigate menu
        Menus.removeMenu(Menus.AppMenuBar.NAVIGATE_MENU);

        //remove the help menu
        Menus.removeMenu(Menus.AppMenuBar.HELP_MENU);
    }

    /**
     * Used to remove the right side tool bar
     */
    function removeRightSideToolBar() {
        Resizer.makeResizable("#main-toolbar");
        Resizer.hide("#main-toolbar");
        $(".content").addClass("hideRightToolbar");
    }

    // Make sure we don't lose focus and hide the status bar in mobile view
    function stealFocus(e) {
        e.preventDefault();
        MainViewManager.setActivePaneId("first-pane");
    }

    function enableFullscreenPreview() {
        $("#main-view").addClass("fullscreen-preview");
    }

    function disableFullscreenPreview() {
        $("#main-view").removeClass("fullscreen-preview");
        MainViewManager.setActivePaneId("first-pane");
        BrambleEvents.triggerFullscreeDisabled();
    }

    function showDesktopView(preventReload) {
        if(!isMobileViewOpen) {
            return;
        }

        $("#bramble-iframe-browser").appendTo("#second-pane");
        $(".phone-wrapper").detach();
        $("#second-pane").removeClass("second-pane-scroll");
        $("#second-pane").off("click", stealFocus);

        isMobileViewOpen = false;
        BrambleEvents.triggerPreviewModeChange("desktop");

        if(!preventReload) {
            PostMessageTransport.reload();
        }
    }

    function showMobileView(preventReload) {
        if(isMobileViewOpen) {
            return;
        }

        $("#bramble-iframe-browser").addClass("phone-body");
        $("#second-pane").append(PhonePreview);
        $("#bramble-iframe-browser").appendTo("#phone-content");
        $("#second-pane").addClass("second-pane-scroll");

        // Give focus back to the editor when the outside of the mobile phone is clicked.
        // Prevents the status bar from disappearing.
        $("#second-pane").on("click", stealFocus);

        isMobileViewOpen = true;
        BrambleEvents.triggerPreviewModeChange("mobile");

        if(!preventReload) {
            PostMessageTransport.reload();
        }
    }

    /**
     * Which preview mode we're in, "desktop" or "mobile"
     */
    function getPreviewMode() {
        return isMobileViewOpen ? "mobile" : "desktop";
    }

    // Define public API
    exports.initUI                 = initUI;
    exports.showMobileView         = showMobileView;
    exports.showDesktopView        = showDesktopView;
    exports.enableFullscreenPreview = enableFullscreenPreview;
    exports.disableFullscreenPreview = disableFullscreenPreview;
    exports.getPreviewMode         = getPreviewMode;
    exports.removeLeftSideToolBar  = removeLeftSideToolBar;
    exports.removeMainToolBar      = removeMainToolBar;
    exports.removeRightSideToolBar = removeRightSideToolBar;
});
