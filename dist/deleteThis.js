﻿var validArgs=function(){for(var e=[],n=PPx.Arguments;!n.atEnd();n.moveNext())e.push(n.value);return e},safeArgs=function(){for(var e=[],n=validArgs(),t=0,r=arguments.length;t<r;t++)e.push(_valueConverter(t<0||arguments.length<=t?undefined:arguments[t],n[t]));return e},_valueConverter=function(e,n){if(null==n||""===n)return null!=e?e:undefined;switch(typeof e){case"number":var t=Number(n);return isNaN(t)?e:t;case"boolean":return null!=n&&"false"!==n&&"0"!==n;default:return n}},e={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",encode:"utf16le",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},useLanguage=function(){var n=PPx.Extract("%*getcust(S_ppm#global:lang)");return"en"===n||"ja"===n?n:e.language},isEmptyStr=function(e){return""===e},n={en:{archive:"Delete this file from archive?",safedel:"Delete this file with SafeDelete?",deleted:"Deleted"},ja:{archive:"書庫から削除しますか？",safedel:"SafeDeleteを実行しますか？",deleted:"削除しました"}};!function(){return 0===PPx.Extract("%n").indexOf("V")}()&&PPx.Quit(-1);var t="ppm-view",r=n[useLanguage()],main=function(){var e=PPx.Extract("%FDC");isEmptyStr(e)?delArchFile():safedelFile(e)},queryAndDo=function(e,n){PPx.Execute('%"'+t+'"%Q"'+e+'"%:'+n)},delArchFile=function(){var e="%u7-zip64.dll,d -hide %FD %FC";":PKZIP"===PPx.GetFileInformation(PPx.Extract("%FDN"))&&queryAndDo(r.archive,e)},safedelFile=function(e){var n="%Oa *file !safedelete,"+e+","+safeArgs("%1")[0]+","+("-qstart -min -nocount -retry:0 -error:0 -backup -undolog -compcmd *linemessage "+r.deleted);queryAndDo(r.safedel,n)};main();
