(function(transport) {
    "use strict";

    //TODO: add support for console.log(one,two, three) arguments

    function _log(s){
        //See Note below about fixing transport for 'data'
        transport.send("bramble-console", s);
    }

    // Bind _log to iframe console. 
    window.console.log = _log;

    // TODO: add support for other methods in console
}(window._Brackets_LiveDev_Transport)); 
