/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/* global Blob, DOMParser */
(function(global) {
    "use strict";

    // This script requires access to the transport to send
    // file requests to the editor as commands
    var transport = global._Brackets_LiveDev_Transport;

    var XMLHttpRequest = global.XMLHttpRequest;
    if(!XMLHttpRequest) {
        return;
    }

    function sendMessage(msg) {
        if(!transport || !transport.send) {
            console.error("[Brackets LiveDev] No transport set");
            return;
        }

        transport.send(JSON.stringify(msg));
    }

    function XMLHttpRequestLiveDev() {
        var self = new XMLHttpRequest();
        var requestUrl;
        var abortCalled = false;

        function decode(data) {
            return (new global.TextDecoder('utf8')).decode(data);
        }

        var open = self.open;
        self.open = function(method, url, async, user, password) {
            if(url.indexOf('//') === -1) {
                requestUrl = url;
                abortCalled = false;
            } else {
                open.apply(self, arguments);
            }
        };

        var send = self.send;
        self.send = function() {
            if(!requestUrl) {
                send.apply(self, arguments);
                return;
            }
            console.log("Sending");

            function handleError(error) {
                if(typeof self.onerror === 'function') {
                    return self.onerror(error);
                }
                console.error("[Brackets LiveDev] XMLHttpRequest error: ", error);
            }

            function setResponse(data) {
                if(data.error && !abortCalled) {
                    return handleError(data.error);
                }

                self.readyState = 4;
                self.status = 200;
                self.statusText = 'OK';

                var responseType = self.responseType;
                if(!responseType || responseType === '') {
                    responseType = 'text';
                }

                switch(responseType) {
                case 'text':
                    self.response = decode(data);
                    self.responseText = self.response;
                    break;
                case 'arraybuffer':
                    self.response = data.buffer;
                    break;
                case 'blob':
                    self.response = new Blob([data], {type: 'application/octet-binary'});
                    break;
                case 'document':
                    // TODO: mime type override here for xml, html, ...?
                    self.response = new DOMParser(decode(data), 'text/html');
                    break;
                case 'json':
                    try {
                        self.response = JSON.parse(decode(data));
                    } catch(e) {
                        return handleError(e);
                    }
                    break;
                }

                if(typeof self.onreadystatechange === 'function' && !abortCalled) {
                    self.onreadystatechange();
                }
                if(typeof self.onload === 'function' && !abortCalled) {
                    // TODO: deal with addEventListener
                    self.onload();
                }
            }

            sendMessage({
                method: "XMLHttpRequest",
                path: requestUrl
            });
        };

        var abort = self.abort;
        self.abort = function() {
            if(!requestUrl) {
                abort.apply(self);
                return;
            }

            abortCalled = true;
        };

        return self;
    }

    global.XMLHttpRequest = XMLHttpRequestLiveDev;

}(this));
