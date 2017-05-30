define(function (require, exports, module) {
    "use strict";

    var Caman               = require("caman");
    var FilerFileSystem     = require("fileSystemImpl");
    var FilerUtils          = require("filesystem/impls/filer/FilerUtils");
    var FileSystemCache     = require("filesystem/impls/filer/FileSystemCache");
    var Path                = require("filesystem/impls/filer/BracketsFiler").Path;
    var mimeFromExt         = require("filesystem/impls/filer/lib/content").mimeFromExt;
    var LiveDevMultiBrowser = require("LiveDevelopment/LiveDevMultiBrowser");

    function initializeFilterButtons(image, imagePath) {
        var imageMimeType = mimeFromExt(Path.extname(imagePath));
        var imageDataRegex = /base64,(.+)/;
        var $saveBtn = $(".btn-image-filter-save");
        var $resetBtn = $(".btn-image-filter-reset");
        var $imageWrapper = $(".image-view .image-wrapper");
        var processing = false;

        $resetBtn.click(function() {
            image.reset();
            $saveBtn.prop("disabled", true);
            $resetBtn.prop("disabled", true);
            $(".image-filters .active-filter").removeClass("active-filter");
        });

        $saveBtn.click(function() {
            var imageBase64Data = image.canvas.toDataURL(imageMimeType);
            var data = FilerUtils.base64ToBuffer(imageDataRegex.exec(imageBase64Data)[1]);
            $(".image-filters .active-filter").removeClass("active-filter");

            FilerFileSystem.writeFile(imagePath, data, {encoding: null}, function(err) {
                if(err) {
                    console.error("[Bramble] Image with filters failed to save with: ", err);
                    return;
                }

                FileSystemCache.refresh(function(err) {
                    if(err) {
                        console.error("[Bramble] Failed to refresh filesystem cache when applying image filters with: ", err);
                    }

                    LiveDevMultiBrowser.reload();

                    $saveBtn.prop("disabled", true);
                    $resetBtn.prop("disabled", true);
                });
            });
        });

        function finishedProcessing() {
            processing = false;
            $imageWrapper.removeClass("processing");
            $saveBtn.prop("disabled", false);
            $resetBtn.prop("disabled", false);
        }

        function applyFilterFn(fnName, args) {
            if(processing){
              return;
            }

            $imageWrapper.addClass("processing");
            processing = true;

            image.reset();
            image[fnName].apply(image, args);
            image.render(function(){
              finishedProcessing();
            });

            $saveBtn.prop("disabled", true);
            $resetBtn.prop("disabled", true);
        }

        /* Filters */
        $(".btn-pinhole").click(function() {
            applyFilterFn("pinhole");
        });
        $(".btn-contrast").click(function() {
            applyFilterFn("contrast", [10]);
        });
        $(".btn-sepia").click(function() {
            applyFilterFn("sepia", [20]);
        });
        $(".btn-vintage").click(function() {
            applyFilterFn("vintage");
        });
        $(".btn-emboss").click(function() {
            applyFilterFn("emboss");
        });
        $(".btn-sunrise").click(function() {
            applyFilterFn("sunrise");
        });
        $(".btn-glowing-sun").click(function() {
            applyFilterFn("glowingSun");
        });

        $(".image-filters").on("click", ".btn", function() {
          $(".image-filters .active-filter").removeClass("active-filter");
          $(this).addClass("active-filter");
        });
    }

    exports.load = function(imageElement, imagePath) {
        var image = Caman(imageElement);
        initializeFilterButtons(image, imagePath);
    };
});
