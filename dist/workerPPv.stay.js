﻿var isEmptyStr=function(e){return""===e},isEmptyObj=function(e){if(e===undefined)return!1;if(null===e)return!0;for(var t in e)return!1;return!0},isZero=function(e){return null!=e&&("0"===e||0===e)},pathSelf=function(){var e,t,n=PPx.ScriptName;return~n.indexOf("\\")?(e=extractFileName(n),t=PPx.Extract("%*name(DKN,"+n+")")):(e=n,t=PPx.Extract("%FDN")),{scriptName:e,parentDir:t.replace(/\\$/,"")}},extractFileName=function(e,t){return void 0===t&&(t="\\"),"\\"!==t&&"/"!==t&&(t="\\"),e.slice(e.lastIndexOf(t)+1)};Array.prototype.indexOf||(Array.prototype.indexOf=function(e,t){var n;if(null==this)throw new Error('Array.indexOf: "this" is null or not defined');var i=Object(this),r=i.length>>>0;if(0===r)return-1;var o=null!=t?t:0;if(Math.abs(o)===Infinity&&(o=0),o>=r)return-1;for(n=Math.max(o>=0?o:r-Math.abs(o),0);n<r;){if(n in i&&i[n]===e)return n;n++}return-1});var ppx_Discard=function(e,t){var n;PPx.StayMode=0,t=null!=(n=t)?n:"","DEBUG"===e&&PPx.linemessage("[DEBUG] discard "+t)},e=["KC_main","KV_main","KV_img","KV_crt","KV_page","KB_edit","K_ppe","K_edit"],_validTable=function(t){return~e.indexOf(t)?t:"KC_main"},_discard=function(e){return function(t){var n=t.table,i=t.label,r=t.mapkey,o=t.cond,a=void 0===o?"instantly":o,u=t.debug,x=void 0===u?"0":u,c=PPx.StayMode,s=PPx.Extract("%n"),p=PPx.Extract("%FDV"),d="*linecust "+i+s+","+_validTable(n)+":"+e+",",P={instantly:"",once:'*if("'+s+'"=="%n")%:',hold:'*if("'+s+'"=="%n")&&("'+p+'"!="%FDV")%:'}[a],f=[d];r&&(PPx.Execute("*mapkey use,"+r),f.push("*mapkey delete,"+r)),f.push('*js ":'+c+',ppx_Discard",'+x+","+i),PPx.Execute(d+"%(*if %*stayinfo("+c+")%:"+P+f.join("%:")+"%)"),PPx.Execute('*run -nostartmsg %0pptrayw.exe -c %%K"@LOADCUST"')}},getStaymodeId=function(e){e=e.indexOf(".")?e.slice(0,e.indexOf(".")):e;var t=Number(PPx.Extract("%*getcust(S_ppm#staymode:"+e+")"));return!Number.isNaN(t)&&t>1e4&&t},t=(_discard("ACTIVEEVENT"),_discard("LOADEVENT"),function(e,t,n,i,r){var o="*linecust "+n+","+_validTable(e),a=o+":"+t+",",u={instantly:"",once:'*if("%n"=="%%n")',hold:'*if("%n"=="%%n")&&("%FDV"=="%%FDV")'}[r];PPx.Execute(o+":"+t+","+u+"%%:"+a+"%%:"+i),PPx.Execute('%K"@LOADCUST"')});String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/,"")}),Array.prototype.removeEmpty||(Array.prototype.removeEmpty=function(){for(var e=[],t=0,n=this.length;t<n;t++){var i=this[t];null==i||""===i||i instanceof Array&&0===i.length||i instanceof Object&&isEmptyObj(i)||e.push(i)}return e});n=PPx.Extract("%*getcust(S_ppm#global:git)"),isEmptyStr(n);var n,i=80120,r="workerPPv",o="lazyRestore.js",a="getSyntaxDocument.js",debugMsg=function(e,t){"DEBUG"===e&&PPx.Execute("*execute C,*linemessage [DEBUG] "+t)},validArgs=function(){for(var e=[],t=PPx.Arguments;!t.atEnd();t.moveNext())e.push(t.value);return e};!function(){return 0===PPx.Extract("%n").indexOf("V")}&&PPx.Quit(-1);var u=50,x="ppmview_worker",c=Number(PPx.Extract("%*getcust(S_ppm#global:disp_width)")),s=c/2-u,cache={idName:PPx.WindowIDName.slice(-1)},main=function(){var e=validArgs(),t=e[0],n=e[1],o=e[2],a=e[3],u=e[4],x=getStaymodeId(r)||i;PPx.StayMode=x,PPx.setProcessValue(r,x),cacheOptions(),ppx_resume(t,n,o,a,u)},ppx_resume=function(e,t,n,i,r){void 0===r&&(r=""),cache.dodge="1"===e,cache.debugMode=r,updateValue("tmod",t),updateValue("xwin",n),updateValue("winpos",i),setSelectEvent(),debugMsg(cache.debugMode,"ppx_resume dodge:"+e+",tmod:"+cache.tmod+",xwin:"+cache.xwin+",winpos:"+cache.winpos),ppx_Dodge()},ppx_GetValue=function(e){return String(cache[e])},ppx_Dodge=function(){cache.dodge&&"1"===PPx.Extract("%*ppxlist(+V)")&&PPx.Execute("*windowposition V"+cache.idName+","+horPos()+","+vertPos())},ppx_ToggleDodge=function(){cache.dodge=!cache.dodge,setSelectEvent(!0)},ppx_ToggleWrap=function(){cache.hasWrap=!cache.hasWrap;var e=PPx.Extract("%L"),t=cache.hasWrap?["-1","wrap"]:["0","no wrap"],n=t[0],i=t[1];PPx.Execute("*viewoption -"+cache.codepage+" -width:"+n+"%:*jumpline "+e+"%:*linemessage "+i)},ppx_ToggleTopmost=function(){cache.hasTopmost=!cache.hasTopmost;var e=cache.hasTopmost?["1","topmost"]:["0","no topmost"],t=e[0],n=e[1];PPx.Execute("*topmostwindow %N,"+t+"%:*linemessage "+n)},ppx_SyntaxUpdate=function(e){if(void 0===e&&(e=""),"TEXT"===cache.viewtype||"DOCUMENT"===cache.viewtype){var t=PPx.Extract("%*script(\"%sgu'ppmlib'\\expandSource.js\",ppm-view,path)");if(isEmptyStr(t))return;PPx.Execute("*execute C,*script "+t+"\\dist\\"+a+","+cache.idName+","+cache.codepage+","+e)}},ppx_Close=function(e){var t=cache.tmod||cache.xwin||cache.winpos;if(cache.dodge&&PPx.Execute("*linecust "+x+",KC_main:SELECTEVENT,"),cache.tmod&&PPx.Execute("*setcust XV_tmod="+cache.tmod),t){var n=pathSelf().parentDir;PPx.Execute("*run -nostartmsg -hide -breakjob -noppb %0ppbw.exe -c *script "+n+"\\"+o+","+cache.idName+',"'+cache.winpos+'","'+cache.xwin+'","$'+cache.debugMode+'"')}else isZero(e)||PPx.Execute('*execute C,*js "if(PPx.SyncView>0){PPx.SyncView=0;};"');debugMsg(cache.debugMode,"ppx_Close tmod:"+cache.tmod+",xwin:"+cache.xwin+",winpos:"+cache.winpos),PPx.StayMode=0},ppx_finally=function(){debugMsg(cache.debugMode,"ppx_finally workerPPv")},updateValue=function(e,t){t&&!isEmptyStr(t)&&(cache[e]=t)},cacheOptions=function(){var e,t=/^.*-(HEX|TEXT|DOCUMENT|IMAGE|RAWIMAGE).*$/,n=PPx.Extract("%*viewoption");cache.viewtype=n.replace(t,"$1"),cache.codepage=null==(e=n.split(" ",2)[1])?void 0:e.slice(1),cache.esc=isZero(n.indexOf("-esc:1")),cache.mime=isZero(n.indexOf("-mime:1")),cache.tag=isZero(n.indexOf("-tag:1")),cache.animate=isZero(n.indexOf("-animate:")),cache.colorprofile=isZero(n.indexOf("-colorprofile:"))},setSelectEvent=function(e){var t,n="*linecust "+x+",KC_main:SELECTEVENT";cache.dodge?(PPx.Execute(n+",%(*execute V,*if %(0%*stayinfo(%sp'"+r+"')%:*js \":"+i+',ppx_Dodge"%)%)'),t="dodge"):(PPx.Execute(n+","),t="no dodge"),e&&PPx.linemessage(t)},horPos=function(){var e=Number(PPx.Extract("%*windowrect(,w)"));return Number(PPx.Extract('%*extract(C,"%%*cursorpos(x)")'))<=s-u?e<s?s:c-e:e<s?s-e:0},vertPos=function(){return Number(PPx.Extract("%*windowrect(,t)"))};main();
