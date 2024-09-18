/* @file Extract the word under the cursor
 * @arg 0 {number} - If non-zero, register the search word
 * @return - the word under the cursor
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import {extractWord, isPPv} from './mod/core.ts';
import {langExtractCursorWord} from './mod/language.ts';

!isPPv && PPx.Quit(-1);

const lang = langExtractCursorWord[useLanguage()];

const main = (): string => {
  const [register] = validArgs();

  if (PPx.Extract('%*getcust(XV_tmod)') !== '1') {
    PPx.linemessage(lang.noCaret);
    PPx.Quit(-1);
  }

  const word = extractWord();
  register === '1' && PPx.Execute(`*addhistory s,${word}`);

  return word;
};

PPx.result = main();
