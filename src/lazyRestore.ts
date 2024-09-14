/* @file Restore PPv settings
 * @arg 0 {string} - Specify a PPv id
 * @arg 1 {string} - value of _WinPos:V
 * @arg 2 {number} - If non-zero, restore PPv titlebar
 * @arg 3 {number} - If non-zero, print debug messages
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {waitMoment} from '@ppmdev/modules/util.ts';
import {debugMsg} from './mod/core.ts';

const main = (): void => {
  const [idName, winpos, xwin, debugMode] = validArgs();

  waitMoment(() => !isEmptyStr(PPx.Extract(`%NV${idName}`)));
  setcust(debugMode, `_WinPos:V${idName}`, winpos.replace(/;/g, ','));
  setcust(debugMode, 'X_win:V', xwin);
  PPx.Execute(`*execute C,*js "if(PPx.SyncView>0){PPx.SyncView=0;};"`);
};

const setcust = (debugMode: string, key: string, value: string): void => {
  if (!isEmptyStr(value)) {
    PPx.Execute(`*setcust ${key}=${value}`);
    debugMsg(debugMode, `lazyRestore setcust:${key}=${value}`);
  }
};

main();
