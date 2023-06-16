//!*script
/**
 * Delete the file being viewed
 *
 * @arg {string} 0 Parent directory path of deleted$ for SafeDelete
 */

var full_path = PPx.Extract('%FDC');

// If the file is an archive
if (full_path === '') {
  var parent_ext = PPx.getFileInformation(PPx.Extract('%FD'));

  if (parent_ext === ':PKZIP' || parent_ext === ':RAR') {
    PPx.Execute('%"ppm-view"%Q"Delete the file from archive?"%:%u7-zip64.dll,d -hide %FD %FC');
    PPx.Quit(1);
  }
}

var trash = PPx.Arguments.length ? PPx.Arguments.Item(0) : '%1';

PPx.Execute(
  '%"ppm-view"%Q"Delete the file?"' +
    '%:%Oa *file !safedelete,' + full_path + ',' + trash + ',' +
    ' -qstart -min -nocount -retry:0 -error:0 -backup -undolog' +
    ' -compcmd *linemessage The file was deleted(SafeDelete)'
);


