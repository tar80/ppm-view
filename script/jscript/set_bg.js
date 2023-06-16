//!*script
/**
 * Set background image in the PPv
 */

var ppv_id = PPx.Extract('%n');
var enable_bg = PPx.Extract('%*getcust(X_bg:T_%n');
var se_disable = 'C:\\Windows\\Media\\chimes.wav';
var se_enable = 'C:\\Windows\\Media\\ding.wav';
var set_bg = function (path, pos, se, msg) {
  PPx.Extract(
    '*setcust X_bg:P_' + ppv_id + '=' + path +
      '%:*setcust X_bg:T_' + ppv_id + '=' + pos +
      '%:*sound ' + se +
      '%:*linemessage ' + msg
  );
};

enable_bg !== '1'
  ? set_bg('%FDCN', '1', se_enable, 'Set this image as background')
  : set_bg(' ', '0', se_disable, 'Background clean');
