/* @file Set up the linked view depending on the situation
 * @arg 0 {number} - If non-zero, always start in page-mode
 * @arg 1 {number} - Specify X_win for PPv. 9-digit number prefixed with B
 * @arg 2 {number} - If non-zero, activate dodge(Move left and right to avoid the cursor)
 * @arg 3 {number} - Specify "DEBUG", display debug messages
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import debug from '@ppmdev/modules/debug.ts';
import {isEmptyStr, isZero} from '@ppmdev/modules/guard.ts';
import {pathSelf} from '@ppmdev/modules/path.ts';
import {capturePPv, hideTitlebar} from '@ppmdev/modules/ppv.ts';
import type {Letters} from '@ppmdev/modules/types.ts';
import {tempValue} from '@ppmdev/modules/util.ts';
import {WORKER_FILENAME} from './mod/core.ts';

const idName = PPx.WindowIDName.slice(-1) as Letters;

const main = (): void => {
  const [isPageMode, xwin, dodge, debugMode] = safeArgs(false, '', '0', '');
  const hasPair = PPx.Pane.Count === 2;
  const syncId = PPx.SyncView;

  if (isZero(syncId)) {
    syncView(isPageMode, xwin, dodge, hasPair, debugMode);
  } else if (syncId === 1) {
    PPx.SyncView = 0;
  } else {
    PPx.Execute(`*closeppx V${idName}`);
  }
};

const syncView = (isPageMode: boolean, xwinSpec: string, dodge: string, hasPair: boolean, debugMode: string): void => {
  const {parentDir} = pathSelf();
  const isExist = !isEmptyStr(PPx.Extract(`%NV${idName}`));
  let [tmod, winpos, xwin] = ['', '', ''];

  if (isPageMode) {
    const tmod_ = PPx.Extract('%*getcust(XV_tmod)');

    if (!isZero(tmod)) {
      PPx.Execute('*setcust XV_tmod=0');
      tmod = tmod_;
    }
  }

  if (hasPair) {
    xwin = hideTitlebar(xwinSpec, idName, isExist);
    winpos = PPx.Extract(`%*getcust(_WinPos:V${idName})`);
    dodge = '0';
    capturePPv(idName, isExist, true);
  } else {
    if (!isExist) {
      const restoreValue = tempValue('X_vpos', '0');
      PPx.Execute(`*launch -nostartmsg -hide -wait:idle %0ppvw.exe -bootid:${idName}`);
      restoreValue();
    }

    const cmdSyncId = `*ppvoption sync ${idName}`;
    const cmdTopmost = `*topmostwindow %NV${idName}`;
    PPx.Execute(`${cmdSyncId}%:${cmdTopmost}%:*wait 0,2%:*focus %n`);
  }

  PPx.Execute(`*execute V${idName},*script ${parentDir}\\${WORKER_FILENAME},${dodge},${tmod},${xwin},"${winpos}",${debugMode}`);
};

main();
