
define(function (require, exports, module) {
    "use strict";

    var AppInit             = brackets.getModule("utils/AppInit"),
        BrambleStartupState = brackets.getModule("bramble/StartupState"),
        SidebarView         = brackets.getModule("project/SidebarView");

    // These vars are initialized by the htmlReady handler
    // below since they refer to DOM elements
    var $secondpane,
        $firstpane,
        $sidebar,
        secondPaneWidth,
        firstPaneWidth,
        sidebarWidth,
        Width;

    var isHidden = false;


    /**
     * Show the Preview.
     */
    function show() {
        
        sidebarWidth = BrambleStartupState.ui("sidebarWidth");
        firstPaneWidth  = BrambleStartupState.ui("firstPaneWidth");
        secondPaneWidth = BrambleStartupState.ui("secondPaneWidth");
        
        Width = firstPaneWidth + sidebarWidth; // total width
        
        if( SidebarView.isVisible() ) {
            $firstpane.width(firstPaneWidth);
        } else {
            $firstpane.width(Width);
        }

        $secondpane.width(secondPaneWidth);
        isHidden = false;   
    }

    /**
     * Hide the Preview.
     */
    function hide() {
        
        sidebarWidth = BrambleStartupState.ui("sidebarWidth");
        secondPaneWidth = BrambleStartupState.ui("secondPaneWidth");
        firstPaneWidth  = BrambleStartupState.ui("firstPaneWidth");
        
        Width = firstPaneWidth + secondPaneWidth; // total width
            
        if(SidebarView.isVisible()) {
            $firstpane.width(Width);
        } else {
            $firstpane.width(Width + sidebarWidth);
        }
        $secondpane.width(0);
        isHidden = true;
    }

    /**
     * Returns the visibility state of the Preview.
     * @return {boolean} true if element is visible, false if it is not visible
     */
    function isVisible() {
        return !isHidden;
    }

    // Initialize items dependent on HTML DOM
    AppInit.htmlReady(function () {
        
        $secondpane = $("#second-pane");
        $firstpane  = $("#first-pane");
        $sidebar    = $("#sidebar");
        
    });

    
    // Define public API
    exports.show        = show;
    exports.hide        = hide;
    exports.isVisible   = isVisible;
});
