/* @file Display Bat output in PPv
 * @arg 0 {string} - PPv's ID
 * @arg 1 {string} - Specify PPv's codepage
 * @arg 2 {string} - Specify Bat additional options. Fixed options are "--color=always --style=changes --wrap-never -l <filetype>"
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {tmp, useLanguage} from '@ppmdev/modules/data.ts';
import debug from '@ppmdev/modules/debug.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {actualPath, extractFileName} from '@ppmdev/modules/path.ts';
import {launchPPv as core} from './mod/core.ts';
import {langLaunchPPv} from './mod/language.ts';

const lang = langLaunchPPv[useLanguage()];

const main = (): void => {
  const [ppvid, codepage, batOpts] = safeArgs('0', '', '');
  const fileName = PPx.Extract('%R');
  const fileExt = PPx.Extract('%t') || fileName;
  let cwd = PPx.Extract('%FDN');

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
      statusMessage(lang.unsupportedDir);
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
      const [fileType, _mediaType] = core.expandExt(path, fileExt);
      const [fileEnc, filterCmd] = core.buildBatCommandWithNkf(fileName, fileType, batOpts, codepage);
      const opts: string[] = [fileEnc, `-document:"%(${filterCmd}%)"`];
      const cmdline = core.composeCmdline(ppvid, path, opts);
      activatePPv(cmdline);
    }
  }
};

const statusMessage = (msg: string): void => PPx.linemessage(`!"${msg}`);

const activatePPv = (cmdline: string): void => {
  PPx.Execute(`*ppv ${cmdline}`);
};

main();
