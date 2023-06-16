//!*script
/**
 * Select word in text under cursor
 *
 */

'use strict';

PPx.Result = (() => {
  const selecttext = PPx.Extract('%*selecttext()');
  const col = PPx.Extract('%lH') - 1;
  const forward = selecttext.slice(0, col);
  const backward = selecttext.slice(col);

  const reg_f = /.*[\/\\\t\s\.,"'`\()<>\[\]\{}](.*)/;
  const reg_b = /([^\/\\\t\s\.,"'`\()<>\[\]\{}]+).*/;
  const reg_s = /^[\/\\\t\s"'`<(\[\{)]*([^\s"'`>)\]}]+).*/;

  if (/^\s*$/.test(forward)) {
    return backward.replace(reg_s, '$1');
  }

  return forward.replace(reg_f, '$1') + backward.replace(reg_b, '$1');
})();
