/* @file Perform action on URI
 * @arg 0 {string} - Specify the command to pass the URI to. Specifying "select" selects the URI
 * @return URI
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {isZero} from '@ppmdev/modules/guard.ts';
import {isPPv, selectionAt} from './mod/core.ts';

!isPPv && PPx.Quit(-1);

const main = (): string => {
  const [cmd] = validArgs();
  const isSelection = cmd === 'select';
  const [cursorCount, uriString] = extractUriString();

  if (cursorCount === -1) {
    return '';
  }

  const rgxUri = /^((?:[a-z]|https?):[/\\]{1,3}[a-z0-9\-\^\\@[\]\./=~`\{\}\+\*\<\>\?_]+(?:#.+)?).*/i;
  let uri = uriString.replace(rgxUri, '$1');
  uri = uri.replace(/[\)\}\]】]$/, '');

  isSelection ? PPx.Execute(`*cursor 4,-${cursorCount}%:*cursor 4,${uri.length},1`) : PPx.Execute(`${cmd} "${uri}"`);

  return uri;
};

const extractUriString = (): [number, string] => {
  const {col, forward, backward} = selectionAt();
  const rgx = /[a-z0-9]+$/i;
  const text = `${forward}${backward}`;
  let colonIdx = forward.lastIndexOf(':');

  if (~colonIdx) {
    if (!~forward.slice(colonIdx).indexOf(' ')) {
      const startIdx = forward.slice(0, colonIdx).replace(rgx, '').length;

      return [col - startIdx, text.slice(startIdx)];
    }
  }

  colonIdx = backward.indexOf(':');

  if (~colonIdx) {
    let startIdx = backward.slice(0, colonIdx).replace(rgx, '').length;
    startIdx = isZero(startIdx) ? forward.replace(rgx, '').length : col + startIdx;

    return [col - startIdx, text.slice(startIdx)];
  }

  return [-1, ''];
};

PPx.result = main();
