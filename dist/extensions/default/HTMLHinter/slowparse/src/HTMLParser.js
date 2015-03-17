module.exports=function(){"use strict";var ParseError=require("./ParseError");var CSSParser=require("./CSSParser");var CHARACTER_ENTITY_REFS={lt:"<",gt:">",apos:"'",quot:'"',amp:"&"};var attributeNameStartChar="A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";var nameStartChar=new RegExp("["+attributeNameStartChar+"]");var attributeNameChar=attributeNameStartChar+"0-9\\-\\.\\u00B7\\u0300-\\u036F\\u203F-\\u2040:";var nameChar=new RegExp("["+attributeNameChar+"]");var checkMixedContent=require("./checkMixedContent").mixedContent;function isActiveContent(tagName,attrName){if(attrName==="href"){return["link"].indexOf(tagName)>-1}if(attrName==="src"){return["script","iframe"].indexOf(tagName)>-1}if(attrName==="data"){return["object"].indexOf(tagName)>-1}return false}var activeTagNode=false;var parentTagNode=false;function isNextTagParent(stream,parentTagName){return stream.findNext(/<\/([\w\-]+)\s*>/,1)===parentTagName}function isNextCloseTag(stream){return stream.findNext(/<\/([\w\-]+)\s*>/,1)}function allowsOmmitedEndTag(parentTagName,tagName){if(tagName==="p"){return["a"].indexOf(parentTagName)>-1}return false}function HTMLParser(stream,domBuilder){this.warnings=[];this.stream=stream;this.domBuilder=domBuilder;this.cssParser=new CSSParser(stream,domBuilder,this.warnings)}function replaceEntityRefs(text){return text.replace(/&([A-Za-z]+);/g,function(ref,name){name=name.toLowerCase();if(name in CHARACTER_ENTITY_REFS)return CHARACTER_ENTITY_REFS[name];return ref})}HTMLParser.prototype={parsingSVG:false,svgNameSpace:"http://www.w3.org/2000/svg",html5Doctype:"<!DOCTYPE html>",voidHtmlElements:["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"],omittableCloseTagHtmlElements:["p","li","td","th"],omittableCloseTags:{p:["address","article","aside","blockquote","dir","div","dl","fieldset","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","main","nav","ol","p","pre","section","table","ul"],th:["th","td"],td:["th","td"],li:["li"]},htmlElements:["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","bgsound","blink","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","command","datalist","dd","del","details","dfn","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","marquee","menu","meta","meter","nav","nobr","noscript","object","ol","optgroup","option","output","p","param","pre","progress","q","rp","rt","ruby","samp","script","section","select","small","source","spacer","span","strong","style","sub","summary","sup","svg","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr"],svgElements:["a","altglyph","altglyphdef","altglyphitem","animate","animatecolor","animatemotion","animatetransform","circle","clippath","color-profile","cursor","defs","desc","ellipse","feblend","fecolormatrix","fecomponenttransfer","fecomposite","feconvolvematrix","fediffuselighting","fedisplacementmap","fedistantlight","feflood","fefunca","fefuncb","fefuncg","fefuncr","fegaussianblur","feimage","femerge","femergenode","femorphology","feoffset","fepointlight","fespecularlighting","fespotlight","fetile","feturbulence","filter","font","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","missing-glyph","mpath","path","pattern","polygon","polyline","radialgradient","rect","script","set","stop","style","svg","switch","symbol","text","textpath","title","tref","tspan","use","view","vkern"],attributeNamespaces:["xlink","xml"],obsoleteHtmlElements:["acronym","applet","basefont","big","center","dir","font","isindex","listing","noframes","plaintext","s","strike","tt","xmp"],webComponentElements:["template","shadow","content"],_isCustomElement:function(tagName){return tagName.search(/^[\w\d]+-[\w\d]+$/)>-1},_knownHTMLElement:function(tagName){return this.voidHtmlElements.indexOf(tagName)>-1||this.htmlElements.indexOf(tagName)>-1||this.obsoleteHtmlElements.indexOf(tagName)>-1||this.webComponentElements.indexOf(tagName)>-1},_knownSVGElement:function(tagName){return this.svgElements.indexOf(tagName)>-1},_knownVoidHTMLElement:function(tagName){return this.voidHtmlElements.indexOf(tagName)>-1},_knownOmittableCloseTagHtmlElement:function(tagName){return this.omittableCloseTagHtmlElements.indexOf(tagName)>-1},_knownOmittableCloseTags:function(activeTagName,foundTagName){return this.omittableCloseTags[activeTagName].indexOf(foundTagName)>-1},_supportedAttributeNameSpace:function(ns){return this.attributeNamespaces.indexOf(ns)!==-1},parse:function(){if(this.stream.match(this.html5Doctype,true,true))this.domBuilder.fragment.parseInfo={doctype:{start:0,end:this.stream.pos}};while(!this.stream.end()){if(this.stream.peek()=="<"){this._buildTextNode();this._parseStartTag()}else this.stream.next()}this._buildTextNode();if(this.domBuilder.currentNode!=this.domBuilder.fragment)throw new ParseError("UNCLOSED_TAG",this);return{warnings:this.warnings.length>0?this.warnings:false}},_buildTextNode:function(){var token=this.stream.makeToken();if(token){this.domBuilder.text(replaceEntityRefs(token.value),token.interval)}},_parseStartTag:function(){if(this.stream.next()!="<")throw new Error('assertion failed, expected to be on "<"');if(this.stream.match("!--",true)){this.domBuilder.pushContext("text",this.stream.pos);this._parseComment();this.domBuilder.pushContext("html",this.stream.pos);return}this.stream.eat(/\//);this.stream.eatWhile(/[\w\d-]/);var token=this.stream.makeToken();var tagName=token.value.slice(1).toLowerCase();if(tagName==="svg")this.parsingSVG=true;if(tagName[0]=="/"){activeTagNode=false;var closeTagName=tagName.slice(1).toLowerCase();if(closeTagName==="svg")this.parsingSVG=false;if(this._knownVoidHTMLElement(closeTagName))throw new ParseError("CLOSE_TAG_FOR_VOID_ELEMENT",this,closeTagName,token);if(!this.domBuilder.currentNode.parseInfo)throw new ParseError("UNEXPECTED_CLOSE_TAG",this,closeTagName,token);this.domBuilder.currentNode.parseInfo.closeTag={start:token.interval.start};var openTagName=this.domBuilder.currentNode.nodeName.toLowerCase();if(closeTagName!=openTagName)throw new ParseError("MISMATCHED_CLOSE_TAG",this,openTagName,closeTagName,token);this._parseEndCloseTag()}else{if(tagName){var badSVG=this.parsingSVG&&!this._knownSVGElement(tagName);var badHTML=!this.parsingSVG&&!this._knownHTMLElement(tagName)&&!this._isCustomElement(tagName);if(badSVG||badHTML){throw new ParseError("INVALID_TAG_NAME",tagName,token)}}else{throw new ParseError("INVALID_TAG_NAME",tagName,token)}var parseInfo={openTag:{start:token.interval.start}};var nameSpace=this.parsingSVG?this.svgNameSpace:undefined;if(activeTagNode&&parentTagNode!=this.domBuilder.fragment){var activeTagName=activeTagNode.nodeName.toLowerCase();if(this._knownOmittableCloseTags(activeTagName,tagName)){this.domBuilder.popElement()}}parentTagNode=this.domBuilder.currentNode;this.domBuilder.pushElement(tagName,parseInfo,nameSpace);if(!this.stream.end())this._parseEndOpenTag(tagName)}},_parseComment:function(){var token;while(!this.stream.end()){if(this.stream.match("-->",true)){token=this.stream.makeToken();this.domBuilder.comment(token.value.slice(4,-3),token.interval);return}this.stream.next()}token=this.stream.makeToken();throw new ParseError("UNTERMINATED_COMMENT",token)},_parseCDATA:function(tagname){var token,matchString="</"+tagname+">",text,textInterval={start:0,end:0},openTagEnd=this.domBuilder.currentNode.parseInfo.openTag.end,closeTagInterval;this.stream.makeToken();while(!this.stream.end()){if(this.stream.match(matchString,true)){token=this.stream.makeToken();text=token.value.slice(0,-matchString.length);closeTagInterval={start:openTagEnd+text.length,end:token.interval.end};this.domBuilder.currentNode.parseInfo.closeTag=closeTagInterval;textInterval.start=token.interval.start;textInterval.end=token.interval.end-(closeTagInterval.end-closeTagInterval.start);this.domBuilder.text(text,textInterval);this.domBuilder.popElement();return}this.stream.next()}throw new ParseError("UNCLOSED_TAG",this)},containsAttribute:function(stream){return stream.eat(nameStartChar)},_parseEndCloseTag:function(){this.stream.eatSpace();if(this.stream.next()!=">"){if(this.containsAttribute(this.stream)){throw new ParseError("ATTRIBUTE_IN_CLOSING_TAG",this)}else{throw new ParseError("UNTERMINATED_CLOSE_TAG",this)}}var end=this.stream.makeToken().interval.end;this.domBuilder.currentNode.parseInfo.closeTag.end=end;this.domBuilder.popElement()},_parseEndOpenTag:function(tagName){var tagMark=this.stream.pos,startMark=this.stream.pos;while(!this.stream.end()){if(this.containsAttribute(this.stream)){if(this.stream.peek!=="="){this.stream.eatWhile(nameChar)}this._parseAttribute(tagName)}else if(this.stream.eatSpace()){this.stream.makeToken();startMark=this.stream.pos}else if(this.stream.peek()==">"||this.stream.match("/>")){var selfClosing=this.stream.match("/>",true);if(selfClosing){if(!this.parsingSVG&&!this._knownVoidHTMLElement(tagName))throw new ParseError("SELF_CLOSING_NON_VOID_ELEMENT",this,tagName)}else this.stream.next();var end=this.stream.makeToken().interval.end;this.domBuilder.currentNode.parseInfo.openTag.end=end;if(tagName&&(selfClosing&&this._knownSVGElement(tagName)||this._knownVoidHTMLElement(tagName)))this.domBuilder.popElement();activeTagNode=false;if(tagName&&this._knownOmittableCloseTagHtmlElement(tagName)){activeTagNode=this.domBuilder.currentNode}if(!this.stream.end()&&tagName==="style"){this.domBuilder.pushContext("css",this.stream.pos);var cssBlock=this.cssParser.parse();this.domBuilder.pushContext("html",this.stream.pos);this.domBuilder.text(cssBlock.value,cssBlock.parseInfo)}if(tagName&&tagName==="script"){this.domBuilder.pushContext("javascript",this.stream.pos);this._parseCDATA("script");this.domBuilder.pushContext("html",this.stream.pos)}if(tagName&&tagName==="textarea"){this.domBuilder.pushContext("text",this.stream.pos);this._parseCDATA("textarea");this.domBuilder.pushContext("html",this.stream.pos)}if(parentTagNode&&parentTagNode!=this.domBuilder.fragment){var parentTagName=parentTagNode.nodeName.toLowerCase(),nextIsParent=isNextTagParent(this.stream,parentTagName),needsEndTag=!allowsOmmitedEndTag(parentTagName,tagName),optionalEndTag=this._knownOmittableCloseTagHtmlElement(parentTagName),nextTagCloses=isNextCloseTag(this.stream);if(nextIsParent&&(needsEndTag||optionalEndTag&&nextTagCloses)){if(this._knownOmittableCloseTagHtmlElement(tagName)){this.domBuilder.popElement()}}}return}else{this.stream.eatWhile(/[^'"\s=<>]/);var attrToken=this.stream.makeToken();if(!attrToken){this.stream.tokenStart=tagMark;attrToken=this.stream.makeToken();var peek=this.stream.peek();if(peek==="'"||peek==='"'){this.stream.next();this.stream.eatWhile(new RegExp("[^"+peek+"]"));this.stream.next();var token=this.stream.makeToken();throw new ParseError("UNBOUND_ATTRIBUTE_VALUE",this,token)}throw new ParseError("UNTERMINATED_OPEN_TAG",this)}attrToken.interval.start=startMark;throw new ParseError("INVALID_ATTR_NAME",this,attrToken)}}},_parseAttribute:function(tagName){var nameTok=this.stream.makeToken();nameTok.value=nameTok.value.toLowerCase();this.stream.eatSpace();if(this.stream.peek()=="="){this.stream.next();if(nameTok.value.indexOf(":")!==-1){var parts=nameTok.value.split(":");if(parts.length>2){throw new ParseError("MULTIPLE_ATTR_NAMESPACES",this,nameTok)}var nameSpace=parts[0],attributeName=parts[1];if(!this._supportedAttributeNameSpace(nameSpace)){throw new ParseError("UNSUPPORTED_ATTR_NAMESPACE",this,nameTok)}}this.stream.eatSpace();this.stream.makeToken();var quoteType=this.stream.next();if(quoteType!=='"'&&quoteType!=="'"){throw new ParseError("UNQUOTED_ATTR_VALUE",this)}if(quoteType==='"'){this.stream.eatWhile(/[^"]/)}else{this.stream.eatWhile(/[^']/)}if(this.stream.next()!==quoteType){throw new ParseError("UNTERMINATED_ATTR_VALUE",this,nameTok)}var valueTok=this.stream.makeToken();if(checkMixedContent&&valueTok.value.match(/http:/)&&isActiveContent(tagName,nameTok.value)){this.warnings.push(new ParseError("HTTP_LINK_FROM_HTTPS_PAGE",this,nameTok,valueTok))}var unquotedValue=replaceEntityRefs(valueTok.value.slice(1,-1));this.domBuilder.attribute(nameTok.value,unquotedValue,{name:nameTok.interval,value:valueTok.interval})}else{this.stream.makeToken();this.domBuilder.attribute(nameTok.value,"",{name:nameTok.interval})}}};HTMLParser.replaceEntityRefs=replaceEntityRefs;return HTMLParser}();