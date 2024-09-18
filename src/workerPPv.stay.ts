/* @file A worker for PPv
 * @arg 0 {number} - If non-zero, activate dodge
 * @arg 1 {number} - XV_tmod value to restore cursor-mode
 * @arg 2 {number} - X_win:V value to restore window options
 * @arg 3 {number} - _WinPos value to restore PPv position
 * @arg 4 {string} - Displays debug messages when "DEBUG" is specified
 * @return - A file name;
 */

import {isEmptyStr, isZero} from '@ppmdev/modules/guard.ts';
import {pathSelf} from '@ppmdev/modules/path.ts';
import {getStaymodeId} from '@ppmdev/modules/staymode.ts';
import {RESTORE_SCRIPT_NAME, STAYMODE_ID, SYNTAX_SCRIPT_NAME, WORKER_NAME, debugMsg, isPPv} from './mod/core.ts';
import { validArgs } from '@ppmdev/modules/argument.ts';

!isPPv && PPx.Quit(-1);

const CURSOR_MARGIN = 50;
const EVENT_LABEL = 'ppmview_worker';
const dispWidth = Number(PPx.Extract('%*getcust(S_ppm#global:disp_width)'));
const dispHalf = dispWidth / 2 - CURSOR_MARGIN;

type ViewOptions = {viewtype: string; codepage: string; esc: boolean; mime: boolean; tag: boolean; animate: boolean; colorprofile: boolean};
type RestoreOptionKey = keyof RestoreOptions;
type RestoreOptions = {tmod: string; winpos: string; xwin: string};
type CacheKeys = keyof Cache;
type Cache = {
  debugMode: string;
  idName: string;
  dodge: boolean;
  hasWrap: boolean;
  hasTopmost: boolean;
} & ViewOptions &
  RestoreOptions;
const cache = {idName: PPx.WindowIDName.slice(-1)} as Cache;

const main = (): void => {
  const [dodge, tmod, xwin, winpos, debugMode] = validArgs();
  const staymodeId = getStaymodeId(WORKER_NAME) || STAYMODE_ID;

  PPx.StayMode = staymodeId;
  PPx.setProcessValue(WORKER_NAME, staymodeId);
  cacheOptions();
  ppx_resume(dodge, tmod, xwin, winpos, debugMode);
};

const ppx_resume = (dodge: string, tmod?: string, xwin?: string, winpos?: string, debugMode = ''): void => {
  cache.dodge = dodge === '1';
  cache.debugMode = debugMode;
  updateValue('tmod', tmod);
  updateValue('xwin', xwin);
  updateValue('winpos', winpos);
  setSelectEvent();
  debugMsg(cache.debugMode, `ppx_resume dodge:${dodge},tmod:${cache.tmod},xwin:${cache.xwin},winpos:${cache.winpos}`);
  ppx_Dodge();
};

const ppx_GetValue = (name: CacheKeys): string => String(cache[name]);

const ppx_Dodge = (): void => {
  if (cache.dodge && PPx.Extract('%*ppxlist(+V)') === '1') {
    PPx.Execute(`*windowposition V${cache.idName},${horPos()},${vertPos()}`);
  }
};

const ppx_ToggleDodge = (): void => {
  cache.dodge = !cache.dodge;
  setSelectEvent(true);
};

const ppx_ToggleWrap = (): void => {
  cache.hasWrap = !cache.hasWrap;
  const col = PPx.Extract('%L');
  const [width, message] = cache.hasWrap ? ['-1', 'wrap'] : ['0', 'no wrap'];
  PPx.Execute(`*viewoption -${cache.codepage} -width:${width}%:*jumpline ${col}%:*linemessage ${message}`);
};

const ppx_ToggleTopmost = (): void => {
  cache.hasTopmost = !cache.hasTopmost;
  const [value, message] = cache.hasTopmost ? ['1', 'topmost'] : ['0', 'no topmost'];
  PPx.Execute(`*topmostwindow %N,${value}%:*linemessage ${message}`);
};

const ppx_SyntaxUpdate = (batOption = ''): void => {
  if (cache.viewtype === 'TEXT' || cache.viewtype === 'DOCUMENT') {
    const parent = PPx.Extract(`%*script("%sgu'ppmlib'\\expandSource.js",ppm-view,path)`);

    if (isEmptyStr(parent)) {
      return;
    }

    PPx.Execute(`*execute C,*script ${parent}\\dist\\${SYNTAX_SCRIPT_NAME},${cache.idName},${cache.codepage},${batOption}`);
  }
};

const ppx_Close = (syncOff: string): void => {
  const hasRestore = cache.tmod || cache.xwin || cache.winpos;
  cache.dodge && PPx.Execute(`*linecust ${EVENT_LABEL},KC_main:SELECTEVENT,`);
  cache.tmod && PPx.Execute(`*setcust XV_tmod=${cache.tmod}`);

  if (hasRestore) {
    const {parentDir} = pathSelf();
    PPx.Execute(
      '*run -nostartmsg -hide -breakjob -noppb ' +
        `%0ppbw.exe -c *script ${parentDir}\\${RESTORE_SCRIPT_NAME},${cache.idName},"${cache.winpos}","${cache.xwin}","$${cache.debugMode}"`
    );
  } else if (!isZero(syncOff)) {
    PPx.Execute(`*execute C,*js "if(PPx.SyncView>0){PPx.SyncView=0;};"`);
  }

  debugMsg(cache.debugMode, `ppx_Close tmod:${cache.tmod},xwin:${cache.xwin},winpos:${cache.winpos}`);
  /** NOTE: In order to prevent reloading the function, staymode must first be unregistered */
  PPx.StayMode = 0;
};

const ppx_finally = (): void => {
  debugMsg(cache.debugMode, 'ppx_finally workerPPv');
};

const updateValue = (key: RestoreOptionKey, value?: string): void => {
  if (value && !isEmptyStr(value)) {
    cache[key] = value;
  }
};

const cacheOptions = (): void => {
  const rgx = /^.*-(HEX|TEXT|DOCUMENT|IMAGE|RAWIMAGE).*$/;
  const viewoption = PPx.Extract('%*viewoption');
  cache.viewtype = viewoption.replace(rgx, '$1');
  cache.codepage = viewoption.split(' ', 2)[1]?.slice(1);
  cache.esc = isZero(viewoption.indexOf('-esc:1'));
  cache.mime = isZero(viewoption.indexOf('-mime:1'));
  cache.tag = isZero(viewoption.indexOf('-tag:1'));
  cache.animate = isZero(viewoption.indexOf('-animate:'));
  cache.colorprofile = isZero(viewoption.indexOf('-colorprofile:'));
};

const setSelectEvent = (show?: boolean): void => {
  const selectevent = `*linecust ${EVENT_LABEL},KC_main:SELECTEVENT`;
  let message: string;

  if (cache.dodge) {
    PPx.Execute(`${selectevent},%(*execute V,*if %(0%*stayinfo(%sp'${WORKER_NAME}')%:*js ":${STAYMODE_ID},ppx_Dodge"%)%)`);
    message = 'dodge';
  } else {
    PPx.Execute(`${selectevent},`);
    message = 'no dodge';
  }

  show && PPx.linemessage(message);
};

const horPos = (): number => {
  const ppvWidth = Number(PPx.Extract('%*windowrect(,w)'));
  const cursorPos = Number(PPx.Extract(`%*extract(C,"%%*cursorpos(x)")`));

  if (cursorPos <= dispHalf - CURSOR_MARGIN) {
    return ppvWidth < dispHalf ? dispHalf : dispWidth - ppvWidth;
  } else {
    return ppvWidth < dispHalf ? dispHalf - ppvWidth : 0;
  }
};

const vertPos = (): number => Number(PPx.Extract('%*windowrect(,t)'));

main();
