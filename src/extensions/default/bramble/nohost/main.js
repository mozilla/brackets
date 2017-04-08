/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global define, brackets */

define(function (require, exports, module) {
    "use strict";

    var LiveDevServerManager = brackets.getModule("LiveDevelopment/LiveDevServerManager");
    var ProjectManager       = brackets.getModule("project/ProjectManager");
    var HTMLServer           = require("nohost/HTMLServer").HTMLServer;

    var _HTMLServer;

    function getHTMLServer() {
        if (!_HTMLServer) {
            _HTMLServer = new HTMLServer({
                pathResolver    : ProjectManager.makeProjectRelativeIfPossible,
                root            : ProjectManager.getProjectRoot()
            });
        }
        return _HTMLServer;
    }

    function init() {
        LiveDevServerManager.registerServer({ create: getHTMLServer }, 9001);
    }

    exports.init = init;
    exports.getHTMLServer = getHTMLServer;
});
