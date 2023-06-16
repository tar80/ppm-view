//!*script
/**
 * Set background image in the PPv
 */

'use strict';

const ppv_id = PPx.Extract('%n');
const enable_bg = PPx.Extract('%*getcust(X_bg:T_%n)');
const se_disable = 'C:\\Windows\\Media\\speech off.wav';
const se_enable = 'C:\\Windows\\Media\\speech on.wav';
const set_bg = (path, pos, se, msg) =>
  PPx.Execute(
    `*setcust X_bg:P_${ppv_id}=${path}%:*setcust X_bg:T_${ppv_id}=${pos}%:*sound "${se}"%:*linemessage ${msg}`
  );

enable_bg !== '1'
  ? set_bg('%FDCN', '1', se_enable, 'Set this image as background')
  : set_bg(' ', '0', se_disable, 'Background clean');
