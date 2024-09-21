/* @file Find within the file being viewed
 * @arg 0 {string} - If non-zero, find previous match
 * @arg 1 {number} - If non-zero, hover the cursor over the matching word
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {withinPPv} from '@ppmdev/modules/ppv.ts';
import {caretMatchWord, extractWord} from './mod/core.ts';

!withinPPv() && PPx.Quit(-1);

const main = (): void => {
  const [isPrev, isFollow] = safeArgs(false, false);

  if (PPx.Extract('%*getcust(XV_tmod)') === '0') {
    const sendkey = isPrev ? 'B' : 'F';
    PPx.Execute(`%K"@${sendkey}"`);

    return;
  }

  const word = extractWord();
  const searchWord = find(word, isPrev);
  isFollow && caretMatchWord(searchWord, isPrev);
};

const find = (word: string, isPrev: boolean): string => {
  const keyemulate = '%k"@RIGHT@SPACE@BS@HOME@\\END"';
  const direction = isPrev ? ' -previous' : '';
  PPx.Execute(`${keyemulate}%:*find "${word}" -dialog${direction}`);

  return PPx.Extract('%hs0');
};

main();
