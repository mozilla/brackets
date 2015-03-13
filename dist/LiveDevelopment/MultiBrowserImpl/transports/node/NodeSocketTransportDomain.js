(function(){"use strict";var WebSocketServer=require("ws").Server,_=require("lodash");var _wsServer;var _domainManager;var _nextClientId=1;var _clients={};var SOCKET_PORT=8123;function _clientForSocket(ws){return _.find(_clients,function(client){return client.socket===ws})}function _createServer(){if(!_wsServer){_wsServer=new WebSocketServer({port:SOCKET_PORT});_wsServer.on("connection",function(ws){ws.on("message",function(msg){console.log("WebSocketServer - received - "+msg);var msgObj;try{msgObj=JSON.parse(msg)}catch(e){console.error("nodeSocketTransport: Error parsing message: "+msg);return}if(msgObj.type==="connect"){if(!msgObj.url){console.error("nodeSocketTransport: Malformed connect message: "+msg);return}var clientId=_nextClientId++;_clients[clientId]={id:clientId,url:msgObj.url,socket:ws};console.log("emitting connect event");_domainManager.emitEvent("nodeSocketTransport","connect",[clientId,msgObj.url])}else if(msgObj.type==="message"){var client=_clientForSocket(ws);if(client){_domainManager.emitEvent("nodeSocketTransport","message",[client.id,msgObj.message])}else{console.error("nodeSocketTransport: Couldn't locate client for message: "+msg)}}else{console.error("nodeSocketTransport: Got bad socket message type: "+msg)}}).on("error",function(e){var client=_clientForSocket(ws);console.error("nodeSocketTransport: Error on socket for client "+JSON.stringify(client)+": "+e)}).on("close",function(){var client=_clientForSocket(ws);if(client){_domainManager.emitEvent("nodeSocketTransport","close",[client.id]);delete _clients[client.id]}else{console.error("nodeSocketTransport: Socket closed, but couldn't locate client")}})})}}function _cmdStart(url){_createServer()}function _cmdSend(idOrArray,msgStr){if(!Array.isArray(idOrArray)){idOrArray=[idOrArray]}idOrArray.forEach(function(id){var client=_clients[id];if(!client){console.error("nodeSocketTransport: Couldn't find client ID: "+id)}else{client.socket.send(msgStr)}})}function _cmdClose(clientId){var client=_clients[clientId];if(client){client.socket.close();delete _clients[clientId]}}function init(domainManager){_domainManager=domainManager;if(!domainManager.hasDomain("nodeSocketTransport")){domainManager.registerDomain("nodeSocketTransport",{major:0,minor:1})}domainManager.registerCommand("nodeSocketTransport","start",_cmdStart,false,"Creates the WS server",[]);domainManager.registerCommand("nodeSocketTransport","send",_cmdSend,false,"Sends a message to a given client or list of clients",[{name:"idOrArray",type:"number|Array.<number>",description:"id or array of ids to send the message to"},{name:"message",type:"string",description:"JSON message to send"}],[]);domainManager.registerCommand("nodeSocketTransport","close",_cmdClose,false,"Closes the connection to a given client",[{name:"id",type:"number",description:"id of connection to close"}],[]);domainManager.registerEvent("nodeSocketTransport","connect",[{name:"clientID",type:"number",description:"ID of live preview page connecting to live development"},{name:"url",type:"string",description:"URL of page that live preview is connecting from"}]);domainManager.registerEvent("nodeSocketTransport","message",[{name:"clientID",type:"number",description:"ID of live preview page sending message"},{name:"msg",type:"string",description:"JSON message from client page"}]);domainManager.registerEvent("nodeSocketTransport","close",[{name:"clientID",type:"number",description:"ID of live preview page being closed"}])}exports.init=init})();