define(function(require,exports,module){"use strict";var AppInit=brackets.getModule("utils/AppInit"),CommandManager=brackets.getModule("command/CommandManager"),Commands=brackets.getModule("command/Commands"),EditorManager=brackets.getModule("editor/EditorManager"),LiveDevServerManager=brackets.getModule("LiveDevelopment/LiveDevServerManager"),PreferencesManager=brackets.getModule("preferences/PreferencesManager"),ProjectManager=brackets.getModule("project/ProjectManager"),LiveDevelopment=brackets.getModule("LiveDevelopment/LiveDevMultiBrowser"),UrlParams=brackets.getModule("utils/UrlParams").UrlParams,ViewCommand=brackets.getModule("view/ViewCommandHandlers"),Editor=brackets.getModule("editor/Editor").Editor,Browser=require("lib/iframe-browser"),HideUI=require("lib/hideUI"),Launcher=require("lib/launcher").Launcher,NoHostServer=require("nohost/src/NoHostServer").NoHostServer,ExtensionUtils=brackets.getModule("utils/ExtensionUtils"),PostMessageTransport=require("lib/PostMessageTransport");var _server,codeMirror,fs=appshell.Filer.fs(),parentWindow=window.parent,params=new UrlParams;var defaultHTML=require("text!lib/default.html");PreferencesManager.setViewState("afterFirstLaunch",false);params.remove("skipSampleProjectLoad");function _getServer(){if(!_server){_server=new NoHostServer({pathResolver:ProjectManager.makeProjectRelativeIfPossible,root:ProjectManager.getProjectRoot()})}return _server}function parseData(data,deferred){var dataReceived=data;try{data=dataReceived||null;data=JSON.parse(data);data=data||{}}catch(err){if(dataReceived==="process-tick"){return false}console.error("Parsing message from thimble failed: ",err);if(deferred){deferred.reject()}return false}return data}function _configureLiveDev(){Browser.init();function _configureModules(){PostMessageTransport.setIframe(Browser.getBrowserIframe());LiveDevelopment.setTransport(PostMessageTransport);LiveDevelopment.setLauncher(new Launcher({browser:Browser,server:_getServer()}));LiveDevelopment.open()}LiveDevelopment.one("statusChange",_configureModules)}ProjectManager.one("projectOpen",_configureLiveDev);function _buttonListener(event){var msgObj;try{msgObj=JSON.parse(event.data)}catch(e){return}if(msgObj.commandCategory==="menuCommand"){codeMirror.focus();CommandManager.execute(Commands[msgObj.command])}else if(msgObj.commandCategory==="viewCommand"){ViewCommand[msgObj.command](msgObj.params)}else if(msgObj.commandCategory==="editorCommand"){Editor[msgObj.command](msgObj.params)}}AppInit.extensionsLoaded(function(){var prefs=PreferencesManager.getExtensionPrefs("livedev");prefs.set("multibrowser",true);ExtensionUtils.loadStyleSheet(module,"stylesheets/tutorials.css");LiveDevServerManager.registerServer({create:_getServer},9001)});AppInit.appReady(function(){HideUI.hide();parentWindow.postMessage(JSON.stringify({type:"bramble:loaded"}),"*");codeMirror=EditorManager.getActiveEditor()._codeMirror;parentWindow.postMessage(JSON.stringify({type:"bramble:change",sourceCode:codeMirror.getValue(),lastLine:codeMirror.lastLine(),scrollInfo:codeMirror.getScrollInfo()}),"*");codeMirror.on("change",function(){parentWindow.postMessage(JSON.stringify({type:"bramble:change",sourceCode:codeMirror.getValue(),lastLine:codeMirror.lastLine()}),"*")});codeMirror.on("viewportChange",function(){parentWindow.postMessage(JSON.stringify({type:"bramble:viewportChange",scrollInfo:codeMirror.getScrollInfo()}),"*")});window.addEventListener("message",function(e){var data=parseData(e.data);var value;var mark;if(!data){return}if(data.type!=="bramble:edit"){return}if(!data.fn){console.error("No edit function sent from thimble to call on code mirror");return}if(data.fn==="setGutterMarker"&&data.params[2]){mark=document.createElement(data.params[2].name);var attributes=data.params[2].attributes;Object.keys(attributes).forEach(function(attrName){$(mark).attr(attrName,attributes[attrName])});mark.innerHTML=data.params[2].innerHTML;data.params[2]=mark}if(data.fn==="getLineHeight"){var codeMirrorLine=document.querySelector(data.params[0]);value=parseFloat(window.getComputedStyle(codeMirrorLine).height)}else{value=codeMirror[data.fn].apply(codeMirror,data.params)}if(value===undefined||value===null){return}parentWindow.postMessage(JSON.stringify({type:"bramble:edit",fn:data.fn,value:typeof value!=="object"?value:undefined}),"*")})});exports.initExtension=function(){var deferred=new $.Deferred;function _getInitialDocument(e){var data=parseData(e.data,deferred);if(!data||data.type!=="bramble:init"){return}window.removeEventListener("message",_getInitialDocument);window.addEventListener("message",_buttonListener);fs.writeFile("/index.html",data.source?data.source:defaultHTML,function(err){if(err){deferred.reject();return}deferred.resolve()})}window.addEventListener("message",_getInitialDocument);window.parent.postMessage(JSON.stringify({type:"bramble:init"}),"*");return deferred.promise()}});