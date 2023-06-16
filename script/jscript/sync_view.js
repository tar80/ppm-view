﻿//!*script
/**
 * Set up SyncView to suit the situation
 *
 * @arg {number} 0 If nonzero, always start in page-mode
 * @arg {number} 1 Specify PPv X_win. 9-digit number prefixed with B
 * @arg {number} 2 If nonzero, PPv move left and right to avoid the cursor position
 */

var pane_count = PPx.Pane.Count;
var id_name = PPx.WindowIDName.slice(2);
var ppv_xwin = PPx.Extract('%*getcust(X_win:V)');

var g_args = function (args) {
  var arr = ['0', ppv_xwin];

  for (var i = 0, l = args.length; i < l; i++) {
    arr[i] = args(i);
  }

  return {
    tmod: arr[0],
    xwin: arr[1].substring(2),
    busy: arr[2]
  };
};

var sync_state = function (args) {
  var postcmd = '*ppvoption sync ' + id_name;

  if (pane_count === 2) {
    if (PPx.Extract('%NV' + id_name) !== '') {
      PPx.Execute('*closeppx V' + id_name);
    }

    var tmod = PPx.Extract('%*getcust(XV_tmod)');

    if (args.tmod !== '0') {
      PPx.Execute('*setcust XV_tmod=0');
    }

    var winpos = PPx.Extract('%*getcust(_WinPos:V' + id_name + ')');
    var linecust = '*linecust restoreppv,KV_main:CLOSEEVENT,';
    var scriptpath =
      '%%*getcust(S_ppm#plugins:ppm-view)\\script\\%%*getcust(S_ppm#global:scripttype)\\restore_ppv.js';

    //NOTE: Run in a separate process, as the restore settings are not reflected until after the PPv-window is closed.
    PPx.Execute(
      '%Oin *ppv -bootid:' + id_name + ' -k ' + linecust +
        '%(*ifmatch V' + id_name + ',%%n%%:' +
        '*pptray -c *script ' + scriptpath + ',' + id_name + ',' + tmod + ',' + args.xwin + ',"' + winpos +
        '"%%:' + linecust + '%)'
    );
    PPx.Execute('*capturewindow V' + id_name + ' -pane:~ -selectnoactive%:' + postcmd);
  } else {
    if (args.buzy !== '0') {
      PPx.Execute(
        '*script %*getcust(S_ppm#plugins:ppm-view)\\script\\%*getcust(S_ppm#global:scripttype)\\set_busy.js'
      );
    }

    PPx.Execute('*setcust X_vpos=0');
    PPx.Execute( '*ppv -r -bootid:' + id_name + ' -k *topmostwindow %%NV' + id_name + ',1%%:*execute C,' + postcmd);
  }
};

var set_xwin = function (value) {
  PPx.Execute('*setcust X_win:V=' + value);
};

if (!PPx.SyncView) {
  var args = g_args(PPx.Arguments);
  set_xwin(pane_count === 2 ? 'B1' + args.xwin : 'B0' + args.xwin);
  sync_state(args);
} else {
  PPx.SyncView = 0;
}
