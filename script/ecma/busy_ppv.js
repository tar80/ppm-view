//!*script
/**
 * Automatically adjust the PPv position
 *
 * NOTE:If %sp'restppv'=1, stop an adjustment
 */

'use strict';

const display_width = Number(PPx.Extract('%*getcust(S_ppm#user:dispwidth)'));

{
  // Stop an adjustment. If %sp'restppv'=1 or there is more than one PPv
  const stop_adjust = PPx.Extract('0%*extract(V,%%sp"restppv")');
  const v_count = PPx.Extract('%*ppxlist(+V)');

  if (stop_adjust !== '0' || v_count > 1) {
    PPx.Quit(1);
  }
}

const ppv_id = PPx.WindowIDName;
const adjust_width = () => {
  const dispHalf = display_width / 2 - 10;
  const ppvW = Number(PPx.Extract(`%*windowrect(${ppv_id},w)`));
  const posX = Number(PPx.Extract('%*extract(C,"%%*cursorpos(x)")'));

  // left
  if (posX <= dispHalf - 100) {
    return ppvW < dispHalf ? dispHalf : display_width - ppvW;
  }

  // right
  return ppvW < dispHalf ? dispHalf - ppvW : 0;
};

const adjust_height = () => {
  const ppvH = Number(PPx.Extract(`%*windowrect(${ppv_id},t)`));

  return ppvH < 80 ? ppvH : 80;
};

PPx.Execute(`*windowposition ${ppv_id},${adjust_width()},${adjust_height()}`);
