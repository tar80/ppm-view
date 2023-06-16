//!*script
/**
 * Set buzyPPv
 *
 */

var positioning = function (label) {
  return PPx.Execute(
    '*linecust busyppv,' + label + ':LOADEVENT,' +
      '*script %*getcust(S_ppm#plugins:ppm-view)\\script\\%*getcust(S_ppm#global:scripttype)\\busy_ppv.js'
  );
};

positioning('KV_main');
positioning('KV_img');
PPx.Execute(
  '*linecust busyppv,KV_main:CLOSEEVENT,' +
    '*linecust busyppv,KV_main:CLOSEEVENT,' +
    '%%:*linecust busyppv,KV_main:LOADEVENT,' +
    '%%:*linecust busyppv,KV_img:LOADEVENT,'
);
