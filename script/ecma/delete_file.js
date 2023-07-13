//!*script
/**
 * Delete the file being viewed
 *
 * @arg {string} 0 Parent directory path of deleted$ for SafeDelete
 */

'use strict';

const full_path = PPx.Extract('%FDC');

// If the file is an archive
if (full_path === '') {
  const parent_ext = PPx.GetFileInformation(PPx.Extract('%FDN'));

  if (parent_ext === ':PKZIP' || parent_ext === ':RAR') {
    PPx.Execute('%"ppm-view"%Q"Delete the file from archive?"%:%u7-zip64.dll,d -hide %FD %FC');
    PPx.Quit(1);
  }
}

const trash = PPx.Arguments.length ? PPx.Arguments.Item(0) : '%1';

PPx.Execute(
  '%"ppm-view"%Q"Delete the file?"' +
    `%:%Oa *file !safedelete,${full_path},${trash},` +
    ' -qstart -min -nocount -retry:0 -error:0 -backup -undolog' +
    ' -compcmd *linemessage The file was deleted(SafeDelete)'
);
