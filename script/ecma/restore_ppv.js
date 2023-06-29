//!*script
/**
 * Restore PPv window location
 *
 * @param {string} 0 PPv ID
 * @param {number} 1 PPv XV_tmod
 * @param {number} 2 8-digit number
 * @param {array} 3 PPv window positions
 */

'use strict';

const [ppv_id, tmod, xwin, winpos] = [
  PPx.Arguments(0),
  PPx.Arguments(1),
  PPx.Arguments(2),
  PPx.Arguments(3)
];
let i = 0;

while (PPx.Extract(`%NV${ppv_id}`) !== '') {
  PPx.Execute('*wait 200,2');

  if (i > 10) break;
  i++;
}

PPx.Execute(`*setcust X_win:V=B0${xwin}`);
PPx.Execute(`*setcust _WinPos:V${ppv_id}=${winpos}`);

if (tmod !== '0') {
  PPx.Execute('*setcust XV_tmod=1');
}
