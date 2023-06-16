//!*script
/**
 * Select word in text under cursor
 *
 */

PPx.Result = (function () {
  var selecttext = PPx.Extract('%*selecttext()');
  var col = PPx.Extract('%lH') - 1;
  var forward = selecttext.slice(0, col);
  var backward = selecttext.slice(col);

  var reg_f = /.*[\/\\\t\s\.,"'`\()<>\[\]\{}](.*)/;
  var reg_b = /([^\/\\\t\s\.,"'`\()<>\[\]\{}]+).*/;
  var reg_s = /^[\/\\\t\s"'`<(\[\{)]*([^\s"'`>)\]}]+).*/;

  if (/^\s*$/.test(forward)) {
    return backward.replace(reg_s, '$1');
  }

  return forward.replace(reg_f, '$1') + backward.replace(reg_b, '$1');
})()
