importScripts("thirdparty/requirejs/require.js");var config={};(function(){"use strict";var MessageIds,HintUtils2;var Tern,Infer;require(["./MessageIds","./HintUtils2"],function(messageIds,hintUtils2){MessageIds=messageIds;HintUtils2=hintUtils2;var ternRequire=require.config({baseUrl:"./thirdparty"});ternRequire(["tern/lib/tern","tern/lib/infer","tern/plugin/requirejs","tern/plugin/doc_comment","tern/plugin/angular"],function(tern,infer,requirejs,docComment){Tern=tern;Infer=infer;var ternServer=null,inferenceTimeout;var fileCallBacks={};function getFile(name,next){fileCallBacks[name]=next;self.postMessage({type:MessageIds.TERN_GET_FILE_MSG,file:name})}function _log(msg){self.postMessage({log:msg})}function _reportError(e,file){if(e instanceof Infer.TimedOut){self.postMessage({type:MessageIds.TERN_INFERENCE_TIMEDOUT,file:file})}else{_log("Error thrown in tern_worker:"+e.message+"\n"+e.stack)}}function handleGetFile(file,text){var next=fileCallBacks[file];if(next){try{next(null,text)}catch(e){_reportError(e,file)}}delete fileCallBacks[file]}function initTernServer(env,files){var ternOptions={defs:env,async:true,getFile:getFile,plugins:{requirejs:{},doc_comment:true,angular:true}};ternServer=new Tern.Server(ternOptions);files.forEach(function(file){ternServer.addFile(file)})}function createEmptyUpdate(path){return{type:MessageIds.TERN_FILE_INFO_TYPE_EMPTY,name:path,offsetLines:0,text:""}}function buildRequest(fileInfo,query,offset){query={type:query};query.start=offset;query.end=offset;query.file=fileInfo.type===MessageIds.TERN_FILE_INFO_TYPE_PART?"#0":fileInfo.name;query.filter=false;query.sort=false;query.depths=true;query.guess=true;query.origins=true;query.types=true;query.expandWordForward=false;query.lineCharPositions=true;var request={query:query,files:[],offset:offset,timeout:inferenceTimeout};if(fileInfo.type!==MessageIds.TERN_FILE_INFO_TYPE_EMPTY){request.files.push(fileInfo)}return request}function getJumptoDef(fileInfo,offset){var request=buildRequest(fileInfo,"definition",offset);try{ternServer.request(request,function(error,data){if(error){_log("Error returned from Tern 'definition' request: "+error);self.postMessage({type:MessageIds.TERN_JUMPTODEF_MSG,file:fileInfo.name,offset:offset});return}var response={type:MessageIds.TERN_JUMPTODEF_MSG,file:fileInfo.name,resultFile:data.file,offset:offset,start:data.start,end:data.end};request=buildRequest(fileInfo,"type",offset);ternServer.request(request,function(error,data){if(!error){response.isFunction=data.type.length>2&&data.type.substring(0,2)==="fn"}self.postMessage(response)})})}catch(e){_reportError(e,fileInfo.name)}}function getTernProperties(fileInfo,offset,type){var request=buildRequest(fileInfo,"properties",offset),i;try{ternServer.request(request,function(error,data){var properties=[];if(error){_log("Error returned from Tern 'properties' request: "+error)}else{for(i=0;i<data.completions.length;++i){var property=data.completions[i];properties.push({value:property,type:property.type,guess:true})}}self.postMessage({type:type,file:fileInfo.name,offset:offset,properties:properties})})}catch(e){_reportError(e,fileInfo.name)}}function getTernHints(fileInfo,offset,isProperty){var request=buildRequest(fileInfo,"completions",offset),i;try{ternServer.request(request,function(error,data){var completions=[];if(error){_log("Error returned from Tern 'completions' request: "+error)}else{for(i=0;i<data.completions.length;++i){var completion=data.completions[i];completions.push({value:completion.name,type:completion.type,depth:completion.depth,guess:completion.guess,origin:completion.origin})}}if(completions.length>0||!isProperty){self.postMessage({type:MessageIds.TERN_COMPLETIONS_MSG,file:fileInfo.name,offset:offset,completions:completions})}else{getTernProperties(fileInfo,offset,MessageIds.TERN_COMPLETIONS_MSG)}})}catch(e){_reportError(e,fileInfo.name)}}function getParameters(inferFnType){var recordTypeToString,inferTypeToString,processInferFnTypeParameters,inferFnTypeToString;function inferArrTypeToString(inferArrType){var result="Array.<";inferArrType.props["<i>"].types.forEach(function(value,i){if(i>0){result+=", "}result+=inferTypeToString(value)});if(inferArrType.props["<i>"].types.length===0){result+="Object"}result+=">";return result}recordTypeToString=function(props){var result="{",first=true,prop;for(prop in props){if(Object.prototype.hasOwnProperty.call(props,prop)){if(!first){result+=", "}first=false;result+=prop+": "+inferTypeToString(props[prop])}}result+="}";return result};inferTypeToString=function(inferType){var result;if(inferType instanceof Infer.AVal){inferType=inferType.types[0]}if(inferType instanceof Infer.Prim){result=inferType.toString();if(result==="string"){result="String"}else if(result==="number"){result="Number"}else if(result==="boolean"){result="Boolean"}}else if(inferType instanceof Infer.Arr){result=inferArrTypeToString(inferType)}else if(inferType instanceof Infer.Fn){result=inferFnTypeToString(inferType)}else if(inferType instanceof Infer.Obj){if(inferType.name===undefined){result=recordTypeToString(inferType.props)}else{result=inferType.name}}else{result="Object"}return result};inferFnTypeToString=function(inferType){var result="function(",params=processInferFnTypeParameters(inferType);result+=HintUtils2.formatParameterHint(params,null,null,true);if(inferType.retval){result+="):";result+=inferTypeToString(inferType.retval)}return result};processInferFnTypeParameters=function(inferType){var params=[],i;for(i=0;i<inferType.args.length;i++){var param={},name=inferType.argNames[i],type=inferType.args[i];if(!name){name="param"+(i+1)}if(name[name.length-1]==="?"){name=name.substring(0,name.length-1);param.isOptional=true}param.name=name;param.type=inferTypeToString(type);params.push(param)}return params};return processInferFnTypeParameters(inferFnType)}function handleFunctionType(fileInfo,offset){var request=buildRequest(fileInfo,"type",offset),error;request.query.preferFunction=true;var fnType="";try{ternServer.request(request,function(ternError,data){if(ternError){_log("Error for Tern request: \n"+JSON.stringify(request)+"\n"+ternError);error=ternError.toString()}else{var file=ternServer.findFile(fileInfo.name);var newOffset=offset;if(fileInfo.type===MessageIds.TERN_FILE_INFO_TYPE_PART){newOffset={line:offset.line+fileInfo.offsetLines,ch:offset.ch}}request=buildRequest(createEmptyUpdate(fileInfo.name),"type",newOffset);var expr=Tern.findQueryExpr(file,request.query);Infer.resetGuessing();var type=Infer.expressionType(expr);type=type.getFunctionType()||type.getType();if(type){fnType=getParameters(type)}else{ternError="No parameter type found";_log(ternError)}}})}catch(e){_reportError(e,fileInfo.name)}self.postMessage({type:MessageIds.TERN_CALLED_FUNC_TYPE_MSG,file:fileInfo.name,offset:offset,fnType:fnType,error:error})}function handleAddFiles(files){files.forEach(function(file){ternServer.addFile(file)})}function handleUpdateFile(path,text){ternServer.addFile(path,text);self.postMessage({type:MessageIds.TERN_UPDATE_FILE_MSG,path:path});ternServer.reset()}function handlePrimePump(path){var fileInfo=createEmptyUpdate(path),request=buildRequest(fileInfo,"completions",{line:0,ch:0});try{ternServer.request(request,function(error,data){self.postMessage({type:MessageIds.TERN_PRIME_PUMP_MSG,path:path})})}catch(e){_reportError(e,path)}}function setConfig(configUpdate){config=configUpdate}self.addEventListener("message",function(e){var file,text,offset,request=e.data,type=request.type;if(config.debug){_log("Message received "+type)}if(type===MessageIds.TERN_INIT_MSG){var env=request.env,files=request.files;inferenceTimeout=request.timeout;initTernServer(env,files)}else if(type===MessageIds.TERN_COMPLETIONS_MSG){offset=request.offset;getTernHints(request.fileInfo,offset,request.isProperty)}else if(type===MessageIds.TERN_GET_FILE_MSG){file=request.file;text=request.text;handleGetFile(file,text)}else if(type===MessageIds.TERN_CALLED_FUNC_TYPE_MSG){offset=request.offset;handleFunctionType(request.fileInfo,offset)}else if(type===MessageIds.TERN_JUMPTODEF_MSG){offset=request.offset;getJumptoDef(request.fileInfo,offset)}else if(type===MessageIds.TERN_ADD_FILES_MSG){handleAddFiles(request.files)}else if(type===MessageIds.TERN_PRIME_PUMP_MSG){handlePrimePump(request.path)}else if(type===MessageIds.TERN_GET_GUESSES_MSG){offset=request.offset;getTernProperties(request.fileInfo,offset,MessageIds.TERN_GET_GUESSES_MSG)}else if(type===MessageIds.TERN_UPDATE_FILE_MSG){handleUpdateFile(request.path,request.text)}else if(type===MessageIds.SET_CONFIG){setConfig(request.config)}else{_log("Unknown message: "+JSON.stringify(request))}});self.postMessage({type:MessageIds.TERN_WORKER_READY})})})})();