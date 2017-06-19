define(function (require, exports, module) {
    "use strict";

    var togetherjs = require("togetherjs");

    function Collaboration() {
        this.togetherjs = togetherjs;
        var self = this;
        self.togetherjs();
        this.init();
    }

    Collaboration.prototype.init = function() {
        var self = this;
        self.changing  = false;
        self.togetherjs.hub.on("data", function(delta) {
            if(!self.codemirror || self.changing) {
             return;
            }
            delta = delta.delta;
            self.changing = true;
            var cm = self.codemirror;
            var start = cm.indexFromPos(delta.from);
             // apply the delete operation first
            if (delta.removed.length > 0) {
                var delLength = 0;
                for (var i = 0; i < delta.removed.length; i++) {
                 delLength += delta.removed[i].length;
                }
                delLength += delta.removed.length - 1;
                var from = cm.posFromIndex(start);
                var to = cm.posFromIndex(start + delLength);
                cm.replaceRange('', from, to);
            }
            // apply insert operation
            var param = delta.text.join('\n');
            var from = cm.posFromIndex(start);
            var to = from;
            cm.replaceRange(param, from, to);
            self.changing = false;
        });
    };

    Collaboration.prototype.setCodemirror = function(codemirror) {
       this.codemirror = codemirror;
    };

    Collaboration.prototype.triggerCodemirrorChange = function(changeList) {
        if(!this.changing) {
            for(var i = 0; i<changeList.length; i++) {
                this.togetherjs.send({
                    type: 'data',
                    delta: changeList[i]
                });  
            }
        }
    };

    exports.Collaboration = Collaboration;
});
