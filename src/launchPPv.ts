/* @file Supports PPv launch
 * @arg 0 {number|string} - PPv ID can de specified. A-Z | 0(Not specified)
 * @arg 1 {number|string} - View mode can de specified. hex | doc | image | 0(Not specified)
 * @arg 2 {number} - Specify the value of the X_vpos
 * @arg 3 {number} - If non-zero, activate dodge(Move left and right to avoid the cursor)
 * @arg 4 {number} - If 1 is specified, uses bat. If 2 is specified, forces bat usage even if file encoding detection fails.
 *                   8 forces UTF8 assumption. 16 forces UTF16LE assumption.
 * @arg 5 {string} - Specify Bat additional options. Fixed options are "--color=always --style=changes --wrap-never -l <filetype>"
 * @arg 6 {string} - Displays debug messages when "DEBUG" is specified
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {tmp, useLanguage} from '@ppmdev/modules/data.ts';
import debug from '@ppmdev/modules/debug.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr, isZero} from '@ppmdev/modules/guard.ts';
import {actualPath, extractFileName, pathSelf} from '@ppmdev/modules/path.ts';
import {WORKER_FILENAME, WORKER_NAME, launchPPv as core} from './mod/core.ts';
import {langLaunchPPv} from './mod/language.ts';

const lang = langLaunchPPv[useLanguage()];

const main = (): void => {
  const [ppvid, typeSpec, vpos, dodge, useBat, batOpts, debugMode] = safeArgs('0', '0', '0', '0', '0', '', '');
  const fileName = PPx.Extract('%R');
  const fileExt = PPx.Extract('%t');
  let cwd = PPx.Extract('%FDN');
  let lazyLoad = '';

  switch (PPx.DirectoryType) {
    case 0:
    case 2:
      statusMessage(lang.invalidDir);
      break;
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      statusMessage(lang.unsupportedDir);
      break;
    case 21:
      cwd = cwd.replace(/^ftp/, 'http');
      activatePPv(ppvid, vpos, dodge, core.composeCmdline(ppvid, `${cwd}/${fileName}`), lazyLoad, debugMode);
      break;
    case 62:
    case 63:
    case 64:
    case 96:
      // biome-ignore lint/suspicious/noFallthroughSwitchClause: deliberate fallthrough for valid processing
      cwd = `${tmp().dir}${extractFileName(cwd)}`;

      if (!fso.FolderExists(cwd)) {
        PPx.Execute(`*makedir ${cwd}`);
      }

      if (!fso.FileExists(`${cwd}\\${fileName}`)) {
        // wait untill *unpack command is finished
        PPx.Extract(`*unpack ${cwd}%&`);
      }

    default: {
      cwd = cwd.replace(/^aux:(\/\/)?S_[^\/\\]+[\/\\]/, '');

      if (cwd === '?' || isEmptyStr(cwd)) {
        statusMessage(lang.unknown);

        break;
      }

      const path = actualPath(`${cwd}\\${fileName}`);
      const [fileType, mediaType] = typeSpec !== '0' ? [fileExt, typeSpec] : core.expandExt(path, fileExt);

      if (mediaType !== 'dir') {
        let cmdline: string;

        if (fileType.toLowerCase() === 'txt') {
          cmdline = core.composeCmdline(ppvid, path, ['-text']);
        } else if (mediaType === 'hex') {
          cmdline = core.composeCmdline(ppvid, path, ['-hex']);
        } else if (mediaType === 'doc') {
          cmdline = core.composeCmdline(ppvid, path, ['-document']);
        } else if (mediaType === 'ppx') {
          cmdline = core.composeCmdline(ppvid, path, ['-utf16']);
        } else if (mediaType === 'image') {
          cmdline = core.composeCmdline(ppvid, path, ['-image', '-colorprofile', '-checkeredpattern']);
        } else if (useBat === '0' || isEmptyStr(fileType)) {
          cmdline = core.composeCmdline(ppvid, path);
        } else {
          let codepage: string | undefined;

          if (useBat === '8') {
            codepage = 'UTF8';
          } else if (useBat === '16') {
            codepage = 'UNICODE';
          }

          const [fileEnc, filterCmd] = core.buildBatCommandWithNkf(fileName, fileType, batOpts, codepage);
          const opts: string[] = [fileEnc, `-document:"%(${filterCmd}%)"`];
          cmdline = core.composeCmdline(ppvid, path, opts);

          if (useBat === '2' && isEmptyStr(fileEnc)) {
            lazyLoad = `*js ":%sp'${WORKER_NAME}',ppx_SyntaxUpdate",${batOpts}`;
          }
        }

        activatePPv(ppvid, vpos, dodge, cmdline, lazyLoad, debugMode);
      }
    }
  }
};

const statusMessage = (msg: string): void => PPx.linemessage(`!"${msg}`);

const activatePPv = (ppvid: string, vpos: string, dodge: string, cmdline: string, lazyLoad: string, debugMode: string): void => {
  const {parentDir} = pathSelf();
  const hasChangePos = !isZero(vpos);
  const postCmdline = [];
  let winpos = '';

  if (hasChangePos) {
    // Run dodge-PPv only when X_vpos is 0
    dodge = '0';
    winpos = PPx.Extract(`%*getcust(_WinPos:V${ppvid})`);
    const savePos = PPx.Extract('%*getcust(X_vpos)');
    postCmdline.push(`*setcust X_vpos=${savePos}`);
    PPx.Execute(`*setcust X_vpos=${vpos}`);
  }

  postCmdline.push(`*script ${parentDir}\\${WORKER_FILENAME},${dodge},,,"${winpos}",${debugMode}`);
  postCmdline.push(lazyLoad);

  PPx.Execute(`*ppv ${cmdline} -k %(${postCmdline.join('%:')}%)`);
};

main();
