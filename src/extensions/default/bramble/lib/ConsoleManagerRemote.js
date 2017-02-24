(function(transport) {
    "use strict";

    var listening = false;

    function _log(s){
        //See Note below about fixing transport for 'data'
        transport.send("bramble-console", s);
    }
}(window._Brackets_LiveDev_Transport)); 
