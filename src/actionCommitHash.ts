/* @file Perform action on URI
 * @arg 0 {string} - Specify the command to pass the hash to. Specifying "select" selects the hash
 * @return URI
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {isPPv} from './mod/core.ts';

if (PPx.Extract('%n').indexOf('V') !== 0) {
  PPx.Quit(-1);
}

const main = (): string => {
  const [cmd] = validArgs();
  const isSelection = cmd === 'select';
  const [cursorCount, commitHash] = extractHashString();

  if (cursorCount === -1) {
    return '';
  }

  isSelection ? PPx.Execute(`*cursor 4,-${cursorCount}%:*cursor 4,${commitHash.length},1`) : PPx.Execute(`${cmd} "${commitHash}"`);

  return commitHash;
};

const extractHashString = (): [number, string] => {
  const col = Number(PPx.Extract('%lH')) - 1;
  const selectText = PPx.Extract('%*selecttext()').replace(/\t/g, ' ');
  const rgx = /[a-z0-9]{7,40}/g;
  const hashs = selectText.match(rgx);

  if (hashs?.length) {
    for (const hash of hashs.reverse()) {
      const hashIdx = selectText.indexOf(hash);

      if (hashIdx <= col) {
        return [col - hashIdx, hash];
      }
    }
  }

  return [-1, ''];
};

PPx.result = main();
