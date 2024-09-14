/* @file Set up the linked view depending on the situation
 * @arg 0 {number} - If non-zero, always start in page-mode
 * @arg 1 {number} - Specify X_win for PPv. 9-digit number prefixed with B
 * @arg 2 {number} - If non-zero, activate dodge(Move left and right to avoid the cursor)
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import debug from '@ppmdev/modules/debug.ts';
import {isEmptyStr, isZero} from '@ppmdev/modules/guard.ts';
import {pathSelf} from '@ppmdev/modules/path.ts';
import {WORKER_FILENAME, WORKER_NAME} from './mod/core.ts';

const {parentDir} = pathSelf();
const idName = PPx.WindowIDName.slice(-1);

const main = (): void => {
  const [isPageMode, xwin, dodge] = safeArgs(false, '', '0');
  const hasPair = PPx.Pane.Count === 2;
  const syncId = PPx.SyncView;

  if (isZero(syncId)) {
    syncView(isPageMode, xwin, dodge, hasPair);
  } else if (syncId === 1) {
    PPx.SyncView = 0;
  } else {
    PPx.Execute(`*closeppx V${idName}`);
  }
};

const syncView = (isPageMode: boolean, xwinSpec: string, dodge: string, hasPair: boolean): void => {
  const hasId = !isEmptyStr(PPx.Extract(`%NV${idName}`));
  const setSyncId = `*ppvoption sync ${idName}`;
  let [tmod, winpos, xwin] = ['', '', ''];

  if (isPageMode) {
    const tmod_ = PPx.Extract('%*getcust(XV_tmod)');

    if (!isZero(tmod)) {
      PPx.Execute('*setcust XV_tmod=0');
      tmod = tmod_;
    }
  }

  if (hasPair) {
    xwin = _setXwin(xwinSpec, idName, hasId);
    dodge = '0';

    if (!hasId) {
      winpos = PPx.Extract(`%*getcust(_WinPos:V${idName})`).replace(/,/g, ';');
      PPx.Execute(`*run -nostartmsg -hide -wait:idle %0ppvw.exe -bootid:${idName}`);
    }

    PPx.Execute(`*capturewindow V${idName} -pane:~ -selectnoactive%:${setSyncId}`);
  } else {
    const topmost = `*topmostwindow %NV${idName}`;

    if (hasId) {
      PPx.Execute(`${topmost}%:${setSyncId}`);
    } else {
      const savePos = PPx.Extract('%*getcust(X_vpos)');
      PPx.Execute('*customize X_vpos=0');
      PPx.Execute(`*run -nostartmsg -wait:idle %0ppvw.exe -bootid:${idName} -k %(${topmost}%)%:${setSyncId}%:`);
      PPx.Execute(`*setcust X_vpos=${savePos}`);
    }
  }

  PPx.Execute(`*execute V${idName},*script ${parentDir}\\${WORKER_FILENAME},${dodge},${tmod},${xwin},${winpos},DEBUG`);
};

const _setXwin = (xwin: string, idName: string, hasId: boolean): string => {
  if (isEmptyStr(xwin)) {
    xwin = PPx.Extract('%*getcust(X_win:V)');
  }

  const hasChange = isZero(xwin.indexOf('B0'));

  if (hasChange) {
    hasId ? PPx.Execute(`*execute V${idName},*layout title`) : PPx.Execute(`*setcust X_win:V=B1${xwin.slice(2)}`);
  }

  return hasChange ? xwin : '';
};

main();
