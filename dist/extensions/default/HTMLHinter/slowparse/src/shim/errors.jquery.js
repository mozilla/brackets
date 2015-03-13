"use strict";(function(jQuery){var $=jQuery;jQuery.extend({errorTemplates:$(),loadErrors:function(basePath,names,cb){var reqs=names.map(function(name){var url=basePath+"errors."+name+".html";return jQuery.get(url)});jQuery.when.apply(jQuery,reqs).then(function(){reqs.forEach(function(req){var div=$("<div></div>").html(req.responseText);$.errorTemplates=$.errorTemplates.add($(".error-msg",div))});cb(null)},function(){cb("ERROR: At least one template file did not load.")})}});jQuery.fn.extend({errorHighlightInterval:function(){var interval=$(this).attr("data-highlight").split(",");var start=parseInt(interval[0]);var end=interval[1]?parseInt(interval[1]):undefined;return{start:start,end:end}},eachErrorHighlight:function(cb){$("[data-highlight]",this).each(function(i){var interval=$(this).errorHighlightInterval();cb.call(this,interval.start,interval.end,i)});return this},fillError:function(error,templates){var selector=".error-msg."+error.type;var template=(templates||$.errorTemplates).filter(selector);if(template.length==0)throw new Error("Error template not found for "+error.type);this.html(_.template(template.html(),error,mustacheSettings)).show();return this}});var _=function createUnderscoreTemplating(){var escapes={"\\":"\\","'":"'",r:"\r",n:"\n",t:"	",u2028:"\u2028",u2029:"\u2029"};for(var p in escapes)escapes[escapes[p]]=p;var escaper=/\\|'|\r|\n|\t|\u2028|\u2029/g;var _={escape:function escape(string){return(""+string).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")},template:function template(text,data,settings){var source="__p+='"+text.replace(escaper,function(match){return"\\"+escapes[match]}).replace(settings.escape||noMatch,function(match,code){return"'+\n((__t=("+unescape(code)+"))==null?'':_.escape(__t))+\n'"})+"';\n";if(!settings.variable)source="with(obj||{}){\n"+source+"}\n";source="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'')};\n"+source+"return __p;\n";var render=new Function(settings.variable||"obj","_",source);if(data)return render(data,_);var template=function(data){return render.call(this,data,_)};template.source="function("+(settings.variable||"obj")+"){\n"+source+"}";return template}};return _}();var mustacheSettings={escape:/\[\[(.+?)\]\]/g}})(jQuery);