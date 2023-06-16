//!*script
/**
 * Restore PPv window location
 *
 * @param {string} 0 PPv ID
 * @param {number} 1 PPv XV_tmod
 * @param {number} 2 8-digit numbeer
 * @param {array} 3 PPv window positions
 */

var ppv_id = PPx.Arguments(0);
var tmod = PPx.Arguments(1);
var xwin = PPx.Arguments(2);
var winpos = PPx.Arguments(3);
var i = 0;

while (PPx.Extract('%NV' + ppv_id) !== '') {
  PPx.Execute('*wait 200,2');

  if (i > 10) break;
  i++;
}

PPx.Execute('*setcust X_win:V=B0' + xwin);
PPx.Execute('*setcust _WinPos:V' + ppv_id + '=' + winpos);

if (tmod !== '0') {
  PPx.Execute('*setcust XV_tmod=1');
}
