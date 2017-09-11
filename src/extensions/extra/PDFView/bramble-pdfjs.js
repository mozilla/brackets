(function(qs, PDFJS) {
    "use strict";

    var iframe = window.frameElement;
    // Size will be a string of the form "256.67 KB"
    var fileSize = iframe.dataset.fileSize;
    // Theme will be one of "dark-theme" or "light-theme"
    var theme = iframe.dataset.theme;
    
    var fileTitle = iframe.dataset.fileTitle;
    /**
     * XXXBramble: PDF viewer doesn't allow passing locales by default for security reasons:
     * https://github.com/mozilla/pdf.js/issues/7432, so we are doing something like what
     * happens internally, see:
     *
     * https://github.com/mozilla/pdf.js/blob/36fb3686ccc5b1cd98e5f20b920bdeb7ed4d359d/web/app.js#L267
     * https://github.com/mozilla/pdf.js/blob/593dec1bb7aec1802abf8268137b0f7adab2ae32/web/ui_utils.js#L211
     **/
    function parseQueryString(query) {
        var parts = query.split("&");
        var params = {};
        for (var i = 0, ii = parts.length; i < ii; ++i) {
            var param = parts[i].split("=");
            var key = param[0].toLowerCase();
            var value = param.length > 1 ? param[1] : null;
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
        return params;
    }

    var params = parseQueryString(qs);
    if ("locale" in params) {
        PDFJS.locale = params["locale"];
    }

    function initMeta(pagesCount) {
        document.querySelector("body").classList.add(theme);
        document.querySelector("#pdf-page-count").innerHTML = pagesCount;
        document.querySelector("#pdf-file-size").innerHTML = fileSize;
        document.querySelector(".file-type").innerHTML = fileTitle;
    }

    // Wait for PDFViewerApplication.eventBus to get loaded and become available
    var poll = setInterval(function pollPDFViewerApplication() {
        if(!(window.PDFViewerApplication && window.PDFViewerApplication.eventBus)) {
            return;
        }

        clearInterval(poll);

        // Wait until we know how many pages there are, then update our meta info
        function onPagesLoaded(e) {
            window.PDFViewerApplication.eventBus.off("pagesloaded", onPagesLoaded);
            initMeta(e.pagesCount);
        };
        window.PDFViewerApplication.eventBus.on("pagesloaded", onPagesLoaded);
    }, 100);

    // Listen for changes to the theme.
    window.onmessage = function(e) {
        var msg = e.data;

        if(msg.indexOf("theme:") !== 0) {
            return;
        }

        var newTheme = msg.split("theme:")[1];
        var body = document.body;
        body.classList.remove(theme);
        body.classList.add(newTheme);
        theme = newTheme;
    };

}(document.location.search.substring(1), window.PDFJS));
