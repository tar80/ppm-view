//!*script
/**
 * Adjust the path and pass file to the PPv
 *
 * @arg {number} 0 If nonzero, display PPv over the PPc. value is evaluated as X_vpos
 * @arg {string} 1 PPv ID can de specified. A-Z | 0(no specified ID)
 * @arg {number} 2 If nonzero, PPv move left and right to avoid the cursor position
 * @arg {number} 3 Specify the browse format. hex | doc | image | 0(no specified)
 * @arg {number} 4 If nonzero, reload file
 * @arg {number} 5 Use the Bat for syntax highlighting. 1=use Bat | 2=use Bat and Nkf for convert utf8 encoding
 * @arg {string} 6 The Bat post options. Fixed options are "--color=always --style=changes --wrap-never -l <ext>"
 */

'use strict';

// have the ppm-listfile
if (PPx.DirectoryType == 4 && PPx.Extract('%*getcust(S_ppm#plugins:ppm-listfile)') !== '') {
  PPx.Execute('*script %*getcust(S_ppm#plugins:ppm-listfile)\\script\\%*getcust(S_ppm#global:scrypttype)\\lf_execute.js,ppv');
  PPx.Quit(1);
}

var ext_type = {
  ':DIR': 'dir',
  ':CPL': 'hex',
  ':SCR': 'hex',
  ':EXE': 'hex',
  ':EXE32': 'hex',
  ':EXE32C': 'hex',
  ':EXEDOS': 'hex',
  ':EXEX64': 'hex',
  ':EXEX64C': 'hex',
  ':PIF': 'hex',
  ':DLL': 'hex',
  ':DRV': 'hex',
  ':IME': 'hex',
  ':OCX': 'hex',
  ':SYS': 'hex',
  ':VXD': 'hex',
  ':HHELP': 'hex',
  ':MP4': 'hex',
  ':EBML': 'hex',
  ':WAV': 'hex',
  ':SMF': 'hex',
  ':RIFF': 'hex',
  ':RCM': 'hex',
  ':LHA': 'hex',
  ':CAB': 'hex',
  ':PKZIP': 'hex',
  ':RAR': 'hex',
  ':SZDD': 'hex',
  ':ZOO': 'hex',
  ':ARJ': 'hex',
  ':AR': 'hex',
  ':TAR': 'hex',
  ':ANI': 'image',
  ':AVI': 'image',
  ':BMP': 'image',
  ':EMF': 'image',
  ':GIF': 'image',
  ':ICON': 'image',
  ':PNG': 'image',
  ':TIFF': 'image',
  ':JPEG': 'image',
  ':PS': 'image',
  ':CDX': 'image',
  ':ACAD': 'image',
  ':WEBP': 'image',
  ':WMF': 'image',
  ':UTEXT': 'doc',
  ':HTML': 'doc',
  ':RTF': 'doc',
  ':PDF': 'doc',
  ':JIS': 'doc',
  ':WRITE': 'doc',
  ':DOCS': 'doc',
  ':OA2': 'doc',
  ':XCHG': 'doc',
  ':HELP': 'doc',
  ':LINK': 'link',
  ':FILELINK': 'link',
  ':TC1': 'ppx',
  ':TC2': 'ppx',
  ':TH1': 'ppx',
  ':TH2': 'ppx'
};

var g_args = function (args) {
  var arr = ['0', '0', '0', '0', '0', '0', ''];

  for (var i = 0, l = args.length; i < l; i++) {
    arr[i] = args(i);
  }

  return {
    fit: arr[0],
    id: arr[1],
    busy: arr[2],
    format: arr[3],
    reload: arr[4],
    bat: arr[5],
    batopt: arr[6]
  };
};

var susie_ext = function () {
  var ext = PPx.Extract('%*getcust(P_susie)').toLowerCase();
  var reg = /\*\.\w+/gm;

  return ext.match(reg) || '';
};

var array_match = function (arr, target) {
  for (var i = 0, l = arr.length; i < l; i++) {
    if (arr[i] === target) {
      return true;
    }
  }
};

var arr_cmd = {
  hex: function () {
    return ['*ppv', boot_id, '-hex', '"' + target_file.name + '"'];
  },
  image: function () {
    return [
      '*ppv',
      boot_id,
      '-image',
      '-colorprofile',
      '-checkeredpattern',
      '"' + target_file.name + '"'
    ];
  },
  doc: function () {
    return ['*ppv', boot_id, '-document', '"' + target_file.name + '"'];
  },
  ppx: function () {
    return ['*ppv', boot_id, '-utf16', '"' + target_file.name + '"'];
  },
  undefined: function (v) {
    var ppv = '*ppv ' + boot_id + ' "' + target_file.name + '"';
    var opts = '-codepage:65001 -document:"%%Obd';
    var filetype = '-l ' + target_file.ext;
    var tempfile = ">%%si'TempFile'";
    var nkf = 'nkf -w';
    var bat = 'bat --paging=never --color=always --style=changes --wrap=never ' + v.batopt;

    return {
      0: [ppv],
      1: [ppv, opts, bat, '""' + target_file.name + '""', tempfile],
      2: [ppv, opts, nkf, '""' + target_file.name + '""', '|', bat, filetype, tempfile]
    }[v.bat];
  }
};

var cmd_line = function (v) {
  var filepath = parent_dir + '\\' + target_file.name;
  var ext = PPx.GetFileInformation(filepath);
  var type = v.format != '0' ? v.format : ext_type[ext];
  var cmd = [];

  if (type === 'dir') {
    PPx.Quit(1);
  }

  if (target_file.ext === '') {
    cmd = ['*ppv', boot_id, '"' + target_file.name + '"'];
  } else if (target_file.ext.toLowerCase() === 'txt') {
    cmd = ['*ppv', boot_id, '-text', '"' + target_file.name + '"'];
  } else {
    if (type === 'link') {
      filepath = PPx.Extract('%*linkedpath(' + filepath + ')');
      parent_dir = PPx.Extract('%*name(D,"' + filepath + '")');
      target_file.name = filepath.slice(parent_dir.length + 1);
      target_file.ext = PPx.Extract('%*name(T,"' + target_file.name + '")');
      viewer.bat = 2;

      return cmd_line(viewer);
    } else {
      if (type !== 'image' && array_match(susie_ext(), '*.' + ext.substring(1).toLowerCase())) {
        type = 'image';
      }

      cmd = arr_cmd[type](viewer);
    }
  }

  return '*cd ' + parent_dir + '%:' + cmd.join(' ');
};

var exec_ppv = function (command) {
  var savepos = PPx.Extract('%*getcust(X_vpos)');
  var newpos = viewer.fit;
  var changePosition = savepos !== newpos;

  if (newpos === '0' && viewer.busy !== '0') {
    PPx.Execute(
      '*script %*getcust(S_ppm#plugins:ppm-view)\\script\\%*getcust(S_ppm#global:scripttype)\\set_busy.js'
    );
  }

  changePosition && PPx.Execute('*customize X_vpos=' + newpos);
  PPx.Execute(command);
  changePosition && PPx.Execute('*setcust X_vpos=' + savepos);
};

var viewer = g_args(PPx.Arguments);
var used_ppv = PPx.getProcessValue('view_usedppv');
var boot_id = (function (id) {
  if (id === '0') {
    if (used_ppv === '') {
      return '';
    }

    id = used_ppv;
  }

  return '-r -bootid:' + id.slice(-1);
})(viewer.id);

var parent_dir = PPx.Extract('%FD');
var target_file = (function (reload) {
  var y, t, name;

  if (reload === '0') {
    y = PPx.Extract('%Y');
    t = PPx.Extract('%t');
    name = t !== '' ? [y, t].join('.') : y;
  } else {
    var path = PPx.Extract('%*extract(V,"%%W")').replace(
      /^PPV\[[A-Z]+\](\((Elevate|Limit)\))?(.+)/,
      '$3'
    );
    parent_dir = path.substring(0, path.lastIndexOf('\\'));
    name = path.substring(parent_dir.length + 1);
    t = name.split('.')[1] || '';
  }

  return {name: name, ext: t};
})(viewer.reload);

switch (PPx.DirectoryType) {
  case 0:
  case 2:
    PPx.setPopLineMessage('!"Not a valid path');
    break;
  case 5:
  case 6:
  case 7:
  case 8:
  case 9:
  case 10:
    PPx.setPopLineMessage('!"Unsupported path');
    break;
  case 21:
    parent_dir = parent_dir.replace(/^ftp/, 'http');
    exec_ppv('*ppv ' + boot_id + ' "' + parent_dir + '/' + target_file.name + '"');
    break;
  case 62:
  case 63:
  case 64:
  case 96:
    exec_ppv('*ppv ' + boot_id + ' "' + parent_dir + '\\' + target_file.name + '"');
    break;
  default:
    parent_dir = parent_dir.replace(/^aux:(\/\/)?S_[^\/\\]+[\/\\]/, '');
    if (parent_dir === '?' || parent_dir === '') {
      PPx.setPopLineMessage('!"Unknown path');
      PPx.Quit(1);
    }

    exec_ppv(cmd_line(viewer));
    used_ppv !== '' && PPx.setProcessValue('view_usedppv', '');
}
