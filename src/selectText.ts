/* @file Selects text within the specified range
 * @arg 0 {string} - Specify the character before the selection
 * @arg 1 {string} - Specify the character after the selection
 * @arg 2 {string} - When "A" is specified, the selection range includes the delimiter
 *
 * NOTE: If you specify "word" as @arg 0, it will select a word.
 *  Also, if you specify "WORD" as @arg 0, it will select a range separated by spaces.
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {rgxSelection, selectionAt} from './mod/core.ts';

const main = (): void => {
  PPx.Execute('*cursor');

  const args = validArgs();
  const {col, forward, backward} = selectionAt();
  let [startIdx, endIdx]: (number | void)[] = [];

  if (args[0] === 'word') {
    startIdx = _matchIdx(forward, rgxSelection.prefix);
    endIdx = _matchIdx(backward, rgxSelection.suffix);
  } else if (args[0] === 'WORD') {
    startIdx = forward.lastIndexOf(' ') + 1;
    endIdx = backward.indexOf(' ');
  } else if (args[0].length > 1) {
    const rgxPrefix = RegExp(`^(.*[${args[0]}]).*$`);
    const rgxSuffix = RegExp(`^([^${args[1]}]+)[${args[1]}].*$`);
    startIdx = _matchIdx(forward, rgxPrefix);
    endIdx = _matchIdx(backward, rgxSuffix);
  } else {
    startIdx = forward.lastIndexOf(args[0]) + 1;
    endIdx = backward.indexOf(args[1]);
  }

  if (startIdx && endIdx) {
    const withDelims = args[2] === 'A' ? [1, 2] : [0, 0];
    const startAt = col - startIdx;
    const endAt = ~endIdx ? endIdx : backward.length;
    PPx.Execute(`*cursor 4,-${startAt + withDelims[0]}%:*cursor 4,${startAt + endAt + withDelims[1]},1`);
  }
};

const _matchIdx = (direction: string, rgx: RegExp): number | void => {
  const replacer = <T>(_m: string, m1: T): T => {
    match = true;

    return m1;
  };

  let match = false;
  const idx = direction.replace(rgx, replacer);

  if (match) {
    return idx.length;
  }
};

main();
