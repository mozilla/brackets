/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, Audio, clearTimeout */

// A module that provides UI utility for every component needed for taking
// a picture
define(function (require, exports, module) {
    "use strict";

    var selfieWidgetHTML = require("text!camera/selfieWidget.html");
    var base64ToBuffer = require("camera/utils").base64ToBuffer;
    var shutter;

    // We hardcode the width of the video interface for now
    var _width = 320;

    // Shutter animation of a camera
    function playSnapAnimation() {
        $("#selfie-video-bg").addClass("on");
        shutter.play();
        var openShutter = setTimeout(function() {
            clearTimeout(openShutter);
            $("#selfie-video-bg").removeClass("on");
        }, 105);
    }

    function Interface(camera) {
        this.camera = camera;
        this.video = camera.video;
        this.photo = camera.photo;
        this.canvas = this.photo.canvas;
    }

    // Initialize all interfaces needed for the selfie taker
    Interface.prototype.init = function() {
        // Replace the request-access message with camera components
        var selfieContainer = $("#selfie-container");
        $("#selfie-allow-access").remove();
        selfieContainer.prepend(selfieWidgetHTML);

        // Camera component initialization
        this.video.interface = document.getElementById("selfie-video");
        this.photo.interface = document.getElementById("selfie-photo");
        //this.canvas.interface = document.getElementById("selfie-canvas");

        // Camera buttons
        this.snapButton = document.getElementById("selfie-snap");
        this.saveButton = document.getElementById("selfie-use");
        this.saveButton.style.display = "initial";

        // Lazy-load shutter sound
        if(!shutter) {
            shutter = new Audio("./extensions/default/BrambleUrlCodeHints/camera/camera-shutter-click-08.mp3");
        }
    };

    // Set the video height
    Interface.prototype.setCameraSize = function(height) {
        this._height = height;
        this.video.interface.setAttribute("height", height);
        this.video.interface.setAttribute("width", _width);
        //this.canvas.interface.setAttribute("height", height);
        //this.canvas.interface.setAttribute("width", _width);
    };

    // Enable the Snap icon for the camera
    Interface.prototype.enableSnapIcon = function() {
        var self = this;

        this.snapButton.addEventListener("click", function(event) {
            event.preventDefault();

            self.saveButton.removeAttribute("disabled");
            playSnapAnimation();
            self.snapPhoto();
        });
    };

    // Read the snapped photo bytes and persist it
    Interface.prototype.snapPhoto = function() {
        if(!this._height) {
            return this.camera.fail();
        }

        var self = this;

        function persistPhoto() {
            /*
            Since we currently aren't using the original pattern we don't have
            a photo object with data to pass this check. Bypass for now.

            var data = self.photo.data;
            if(!data) {
                return self.camera.fail();
            }*/

           console.log("the image is detected to be filtered");
           Caman(canvas, function () {
             this.render(function () {
               var image = this.toBase64();
               var binaryDataStr = /^data:image\/png;base64,(.+)/.exec(image)[1];
               self.camera.savePhoto(base64ToBuffer(binaryDataStr));
               console.log("attributes: " + canvas.width + ", " + canvas.height);
             });
           });
           console.log("photo saved");
        }

        /*
        This used to be for setting up the old canvas

        var context = this.canvas.interface.getContext("2d");
        this.canvas.interface.width = _width;
        this.canvas.interface.height = this._height;

        context.drawImage(this.video.interface, 0, 0, _width, this._height);*/

        // Update the photo component with the snapped photo
        /*
        part of the original pattern to add data to the photo, but we're not
        using a photo object right now
        this.photo.update();*/

        // pattern from http://codepen.io/SitePoint/full/LVpNjp/

          var canvas = document.getElementById("canvas");
          /*resizing the canvas since default is 300*150*/
          canvas.width = 320;
          canvas.height = 240;
          //var canvas = this.canvas;  // changed according to humphd
          //var canvas2 = this.canvas;
          var ctx = canvas.getContext('2d');

          ctx.drawImage(this.video.interface, 0, 0, 320, 240); //new

          //console.log("canvas object is: "+canvas + " other constructor is: "+canvas2);

          /* Enable Cross Origin Image Editing */
          /* initial attempt to load image from polaroid preview image

          var img = new Image();
          img.crossOrigin = '';
          img.src = self.photo.data;
          console.log("img width: "+ img.width + " height " + img.height + "source: " + img.src);
          console.log("save path in camera is: " + self.camera.savePath);

          img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            console.log("loaded width: " + img.width + " height " + img.height);
            ctx.drawImage(img, 0, 0, img.width, img.height);
          }; */

          var $reset = $('#resetbtn');
          var $pinhole = $('#pinholebtn');
          var $contrast = $('#contrastbtn');
          var $sepia = $('#sepiabtn');
          var $vintage = $('#vintagebtn');
          var $emboss = $('#embossbtn');
          var $sunrise = $('#sunrisebtn');
          var $glowingSun = $('#glowingsunbtn');
          $reset.on('click', function(e) {
            $('input[type=range]').val(0);
            Caman(canvas, function() {
              this.revert(false);
              this.render();
              console.log("reset");
            });
          });
          /* Filters */
          $pinhole.on('click', function(e) {
            Caman(canvas, function() { // canvas id reference here to enable scrolling
              this.pinhole().render();
              console.log("filtered: pinhole");
            });
          });
          $contrast.on('click', function(e) {
            Caman(canvas, function() {
              this.contrast(10).render();
              console.log("filtered: contrast");
            });
          });
          $sepia.on('click', function(e) {
            Caman(canvas, function() {
              this.sepia(20).render();
              console.log("filtered: sepia");
            });
          });
          $vintage.on('click', function(e) {
            Caman(canvas, function() {
              this.vintage().render();
              console.log("filtered: vintage");
            });
          });
          $emboss.on('click', function(e) {
            Caman(canvas, function() {
              this.emboss().render();
              console.log("filtered: emboss");
            });
          });
          $sunrise.on('click', function(e) {
            Caman(canvas, function() {
              this.sunrise().render();
              console.log("filtered: sunrise");
            });
          });
          $glowingSun.on('click', function(e) {
            Caman(canvas, function() {
              this.glowingSun().render();
              console.log("filtered: glowing sun");
            });
          });

        //end of pattern

        this.saveButton.removeEventListener("click", persistPhoto);
        this.saveButton.addEventListener("click", persistPhoto);
    };

    // Get the width of the video
    Interface.prototype.getWidth = function() {
        return _width;
    };

    module.exports = Interface;
});
