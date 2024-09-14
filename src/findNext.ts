/* @file Find within the file being viewed
 * @arg 0 {string} - If non-zero, find previous match
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {caretInlineMatch, caretMatchWord, isPPv, selectionAt} from './mod/core.ts';

!isPPv && PPx.Quit(-1);

const main = (): void => {
  const [isPrev] = safeArgs(false);

  if (PPx.Extract('%*getcust(XV_tmod)') === '0') {
    sendSearchKey(isPrev);

    return;
  }

  const word = PPx.Extract('%hs0').toLowerCase();
  const {forward, backward} = selectionAt();
  const matchIdx = getMatchIdx(word, isPrev, forward, backward);

  if (matchIdx > 0) {
    caretInlineMatch(matchIdx, isPrev);
  } else if (sendSearchKey(isPrev)) {
    PPx.Execute('%K"@HOME"')
    caretMatchWord(word, isPrev);
  }
};

const sendSearchKey = (isPrev: boolean): boolean => {
  const sendkey = isPrev ? '[' : ']';
  const currentCol = PPx.Extract('%l');
  PPx.Execute(`%K"@${sendkey}"`);

  return currentCol !== PPx.Extract('%l');
};

const getMatchIdx = (word: string, isPrev: boolean, forward: string, backward: string): number => {
  if (isPrev) {
    const idx = forward.toLowerCase().lastIndexOf(word);
    if (idx !== -1) {
      return forward.length - idx;
    }
  } else {
    return backward.slice(1).toLowerCase().indexOf(word) + 1;
  }

  return -1;
};

main();
