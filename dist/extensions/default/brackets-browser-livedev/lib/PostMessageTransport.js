define(function(require,exports,module){"use strict";var _iframeRef,connId=1;var EventDispatcher=brackets.getModule("utils/EventDispatcher");var PostMessageTransportRemote=require("text!lib/PostMessageTransportRemote.js");EventDispatcher.makeEventDispatcher(module.exports);function setIframe(iframeRef){if(iframeRef){_iframeRef=iframeRef}}function _listener(event){var msgObj;try{msgObj=JSON.parse(event.data)}catch(e){return}if(msgObj.type==="message"){module.exports.trigger("PostMessageTransport","message",[connId,msgObj.message])}}function start(){var win=_iframeRef.contentWindow;win.postMessage("initial message","*");window.addEventListener("message",_listener);module.exports.trigger("PostMessageTransport","connect",[connId,"fakeURL"])}function send(idOrArray,msgStr){var win=_iframeRef.contentWindow;win.postMessage(msgStr,"*")}function close(clientId){window.removeEventListener("message",_listener)}function getRemoteScript(){return"<script>\n"+PostMessageTransportRemote+"</script>\n"}module.exports.getRemoteScript=getRemoteScript;module.exports.setIframe=setIframe;module.exports.start=start;module.exports.send=send;module.exports.close=close});