/* @file Delete the file being viewed on PPv
 * @arg 0 {string} - Specify parent directory path of deleted$ for SafeDelete
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {withinPPv} from '@ppmdev/modules/ppv.ts';
import {langDeleteThis} from './mod/language.ts';

!withinPPv() && PPx.Quit(-1);

const PLUGIN_NAME = 'ppm-view';
const lang = langDeleteThis[useLanguage()];

const main = (): void => {
  const path = PPx.Extract('%FDC');
  isEmptyStr(path) ? delArchFile() : safedelFile(path);
};

const queryAndDo = (question: string, cmdline: string): void => {
  PPx.Execute(`%"${PLUGIN_NAME}"%Q"${question}"%:${cmdline}`);
};

const delArchFile = (): void => {
  const dirExt = PPx.GetFileInformation(PPx.Extract('%FDN'));
  const cmdline = '%u7-zip64.dll,d -hide %FD %FC';

  if (dirExt === ':PKZIP') {
    queryAndDo(lang.archive, cmdline);
  }
};

const safedelFile = (path: string): void => {
  const [trashPath] = safeArgs('%1');
  const options = `-qstart -min -nocount -retry:0 -error:0 -backup -undolog -compcmd *linemessage ${lang.deleted}`;
  const cmdline = `%Oa *file !safedelete,${path},${trashPath},${options}`;
  queryAndDo(lang.safedel, cmdline);
};

main();
