define(function (require, exports, module) {
    "use strict";

    var togetherjs = require("togetherjs");

    function Collaboration() {
        this.togetherjs = togetherjs;
        var self = this;
        window.setTimeout(function() {
            self.togetherjs();
        },  3000);
    }

    exports.Collaboration = Collaboration;
});
