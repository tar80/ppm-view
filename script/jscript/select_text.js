//!*script
/**
 * Select text between spaces
 *
 * @param {number} 0 If nonzero, open selected string as a path
 */

var select_text = PPx.Extract('%*selecttext()');
var current_col = PPx.Extract('%lH') - 1;
var forward_string = select_text.slice(0, current_col);
var backward_string = select_text.slice(current_col);

var forward_length = function (s) {
  s = s.replace(/\t/g, ' ');
  var len = s.lastIndexOf(' ');

  if (~len) {
    len = /^["']/.test(s.substring(len + 1)) ? len + 2 : len + 1;
  } else {
    len = 0;
  }

  return current_col - len;
};

var backward_length = function (s) {
  var len = s.search(/["'\s\t]/);
  len = ~len ? len : s.length;

  return /["']$/.test(s.substring(0, len)) ? len - 1 : len;
};

var open_path = function (f, b) {
  var fso = PPx.CreateObject('Scripting.FileSystemObject');
  var trunc = f.replace(/^(.*["'\s\t]).*/, '$1');
  f = trunc === f ? f : f.substring(trunc.length);
  b = b.replace(/^([^"'\s\t]*).*/, '$1');
  var path = f + b;
  var exits = fso.FileExists(path);

  if (!/^http/.test(path) && !exits) {
    return PPx.linemessage('Path does not exist');
  }

  PPx.Execute('*ppv ' + path);
};

if (PPx.Arguments.length && PPx.Arguments(0) !== '0') {
  open_path(forward_string, backward_string);
} else {
  var bnum = forward_length(forward_string);
  var anum = backward_length(backward_string);
  PPx.Execute('*cursor 4,-' + bnum + '%:*cursor 4,' + bnum + anum + ',1');
}
