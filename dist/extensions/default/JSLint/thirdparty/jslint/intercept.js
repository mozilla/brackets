ADSAFE._intercept(function(id,dom,lib,bunch){"use strict";lib.cookie={get:function(){var c=" "+document.cookie+";",s=c.indexOf(" "+id+"="),v;try{if(s>=0){s+=id.length+2;v=JSON.parse(c.slice(s,c.indexOf(";",s)))}}catch(ignore){}return v},set:function(value){var d,j=JSON.stringify(value).replace(/[=]/g,"\\u003d").replace(/[;]/g,"\\u003b");if(j.length<2e3){d=new Date;d.setTime(d.getTime()+1e9);document.cookie=id+"="+j+";expires="+d.toGMTString()}}}});ADSAFE._intercept(function(id,dom,lib,bunch){"use strict";var now=Date.now||function(){return(new Date).getTime()};if(id==="JSLINT_"){lib.jslint=function(source,options,output){output.___nodes___[0].innerHTML="Working.";var after,report,before=now();JSLINT(source,options);report=JSLINT.report();after=now();output.___nodes___[0].innerHTML=report;return after-before};lib.edition=function(){return JSLINT.edition};lib.tree=function(){return JSLINT.tree}}});