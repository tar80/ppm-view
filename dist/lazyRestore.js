﻿var t,validArgs=function(){for(var t=[],r=PPx.Arguments;!r.atEnd();r.moveNext())t.push(r.value);return t},isEmptyStr=function(t){return""===t},isEmptyObj=function(t){if(t===undefined)return!1;if(null===t)return!0;for(var r in t)return!1;return!0},waitMoment=function(t){for(var r=10;t()&&(PPx.Sleep(100),!(0>=--r)););};String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/,"")}),Array.prototype.removeEmpty||(Array.prototype.removeEmpty=function(){for(var t=[],r=0,e=this.length;r<e;r++){var n=this[r];null==n||""===n||n instanceof Array&&0===n.length||n instanceof Object&&isEmptyObj(n)||t.push(n)}return t}),Array.prototype.indexOf||(Array.prototype.indexOf=function(t,r){var e;if(null==this)throw new Error('Array.indexOf: "this" is null or not defined');var n=Object(this),i=n.length>>>0;if(0===i)return-1;var u=null!=r?r:0;if(Math.abs(u)===Infinity&&(u=0),u>=i)return-1;for(e=Math.max(u>=0?u:i-Math.abs(u),0);e<i;){if(e in n&&n[e]===t)return e;e++}return-1}),t=PPx.Extract("%*getcust(S_ppm#global:git)"),isEmptyStr(t);var debugMsg=function(t,r){"DEBUG"===t&&PPx.Execute("*execute C,*linemessage [DEBUG] "+r)},main=function(){var t=validArgs(),r=t[0],e=t[1],n=t[2],i=t[3];waitMoment((function(){return!isEmptyStr(PPx.Extract("%NV"+r))})),setcust(i,"_WinPos:V"+r,e.replace(/;/g,",")),setcust(i,"X_win:V",n),PPx.Execute('*execute C,*js "if(PPx.SyncView>0){PPx.SyncView=0;};"')},setcust=function(t,r,e){isEmptyStr(e)||(PPx.Execute("*setcust "+r+"="+e),debugMsg(t,"lazyRestore setcust:"+r+"="+e))};main();
