/*jslint vars: true, plusplus: true, devel: true, nomen: true,  regexp: true, indent: 4, maxerr: 50 */
/*global define */

// Camera component to preview the photo taken
define(function (require, exports, module) {
    "use strict";

    function Photo(context) {
        this.context = context;
        this.canvas = {};
        this.data = null;
        //these parameters are made so we don't corrupt the original data
        this.canvas2 = {};
        this.data2 = null;
    }

    // Update the photo with a newly taken snapshot
    Photo.prototype.update = function() {
        this.data = this.canvas.interface.toDataURL("image/png");
        this.interface.setAttribute("src", this.data);
        alert("photo updated");
    };

    //separate function to update the preview image with applied filter
    Photo.prototype.updateWithFilter = function() {
        this.data2 = this.canvas2.interface.toDataURL("image/png");
        this.interface.setAttribute("src", this.data2);
        alert("updated with filter");
    };

    module.exports = Photo;
});
