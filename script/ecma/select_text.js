//!*script
/**
 * Select text between spaces
 *
 * @param {number} 0 If nonzero, open selected string as a path
 */

'use strict';

const select_text = PPx.Extract('%*selecttext()');
const current_col = PPx.Extract('%lH') - 1;
const forward_string = select_text.slice(0, current_col);
const backward_string = select_text.slice(current_col);

const forward_length = (s = forward_string) => {
  s = s.replace(/\t/g, ' ');
  let len = s.lastIndexOf(' ');

  if (~len) {
    len = /^["']/.test(s.substring(len + 1)) ? len + 2 : len + 1;
  } else {
    len = 0;
  }

  return current_col - len;
};

const backward_length = (s = backward_string) => {
  let len = s.search(/["'\s\t]/);
  len = ~len ? len : s.length;

  return /["']$/.test(s.substring(0, len)) ? len - 1 : len;
};

const open_path = (f = forward_string, b = backward_string) => {
  const fso = PPx.CreateObject('Scripting.FileSystemObject');
  const trunc = f.replace(/^(.*["'\s\t]).*/, '$1');
  f = trunc === f ? f : f.substring(trunc.length);
  b = b.replace(/^([^"'\s\t]*).*/, '$1');
  const path = `${f}${b}`;
  const exits = fso.FileExists(path);

  if (!/^http/.test(path) && !exits) {
    return PPx.linemessage('Path does not exist');
  }

  PPx.Execute(`*ppv ${path}`);
};

if (PPx.Arguments.length && PPx.Arguments(0) !== '0') {
  open_path();
} else {
  const bnum = forward_length();
  const anum = backward_length();
  PPx.Execute(`*cursor 4,-${bnum}%:*cursor 4,${bnum + anum},1`);
}
