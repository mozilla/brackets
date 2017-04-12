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
        //added to try and make the selfie-photo part of the interface
        this.gallery = this.photo.canvas2;
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
        this.canvas.interface = document.getElementById("selfie-canvas");
        //I want to try and capture the selfie-photo as part of the interface
        this.gallery.interface = document.getElementById("selfie-photo");

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
        this.canvas.interface.setAttribute("height", height);
        this.canvas.interface.setAttribute("width", _width);
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
            var data = self.photo.data;
            var data2 = self.photo.data2;
            if(!data) {
              alert("no data to save");
                return self.camera.fail();
            }else if(!data2){  //added as a placeholder for different savePhoto
              alert("no data in data2");
            }
            alert("persist call");
            var binaryDataStr = /^data:image\/png;base64,(.+)/.exec(data)[1];
            self.camera.savePhoto(base64ToBuffer(binaryDataStr));
        }

        var context = this.canvas.interface.getContext("2d");
        this.canvas.interface.width = _width;
        this.canvas.interface.height = this._height;
        context.drawImage(this.video.interface, 0, 0, _width, this._height);

        // Update the photo component with the snapped photo
        this.photo.update();
        //this function tries to update the ...2 parameters of photo, but
        //when testing somehow erases photo.data so the photo can't save
        //which means I don't know if the function works regardless
        //this.photo.updateWithFilter();

        this.saveButton.removeEventListener("click", persistPhoto);
        this.saveButton.addEventListener("click", persistPhoto);
    };

    // Get the width of the video
    Interface.prototype.getWidth = function() {
        return _width;
    };

    module.exports = Interface;
});
