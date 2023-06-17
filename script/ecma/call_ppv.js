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
  PPx.Execute('*script %*getcust(S_ppm#plugins:ppm-listfile)\\script\\ecma\\lf_execute.js,ppv');
  PPx.Quit(1);
}

const ext_type = {
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

const g_args = (args = PPx.Arguments) => {
  const arr = ['0', '0', '0', '0', '0', '0', ''];

  for (let i = 0, l = args.length; i < l; i++) {
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

const susie_ext = () => {
  const ext = PPx.Extract('%*getcust(P_susie)').toLowerCase();
  const reg = /\*\.\w+/gm;

  return ext.match(reg) || '';
};

const arr_cmd = {
  hex() {
    return ['*ppv', boot_id, '-hex', `"${file_name}"`];
  },
  image() {
    return ['*ppv', boot_id, '-image', '-colorprofile', '-checkeredpattern', `"${file_name}"`];
  },
  doc() {
    return ['*ppv', boot_id, '-document', `"${file_name}"`];
  },
  ppx() {
    return ['*ppv', boot_id, '-utf16', `"${file_name}"`];
  },
  undefined(v = viewer) {
    const ppv = `*ppv ${boot_id} "${file_name}"`;
    const opts = '-codepage:65001 -document:"%%Obd';
    const filetype = `-l ${file_ext}`;
    const tempfile = ">%%si'TempFile'";
    const nkf = 'nkf -w';
    const bat = `bat --paging=never --color=always --style=changes --wrap=never ${v.batopt}`;

    return {
      0: [ppv],
      1: [ppv, opts, bat, `""${file_name}""`, tempfile],
      2: [ppv, opts, nkf, `""${file_name}""`, '|', bat, filetype, tempfile]
    }[v.bat];
  }
};

const cmd_line = (v = viewer) => {
  let filepath = `${parent_dir}\\${file_name}`;
  const ext = PPx.GetFileInformation(filepath);
  let type = v.format != '0' ? v.format : ext_type[ext];
  let cmd = [];

  if (type === 'dir') {
    PPx.Quit(1);
  }

  if (file_ext === '') {
    cmd = ['*ppv', boot_id, `"${file_name}"`];
  } else if (file_ext.toLowerCase() === 'txt') {
    cmd = ['*ppv', boot_id, '-text', `"${file_name}"`];
  } else {
    if (type === 'link') {
      filepath = PPx.Extract(`%*linkedpath(${filepath})`);
      parent_dir = PPx.Extract(`%*name(D,"${filepath}")`);
      file_name = filepath.slice(parent_dir.length + 1);
      file_ext = PPx.Extract(`%*name(T,"${file_name}")`);
      viewer.bat = 2;

      return cmd_line();
    } else {
      if (type !== 'image' && ~susie_ext().indexOf(`*.${ext.substring(1).toLowerCase()}`)) {
        type = 'image';
      }

      cmd = arr_cmd[type]();
    }
  }

  return `*cd ${parent_dir}%:${cmd.join(' ')}`;
};

const exec_ppv = (command) => {
  const savepos = PPx.Extract('%*getcust(X_vpos)');
  const newpos = viewer.fit;
  const changePosition = savepos !== newpos;

  if (newpos === '0' && viewer.busy !== '0') {
    PPx.Execute(
      '*script %*getcust(S_ppm#plugins:ppm-view)\\script\\%*getcust(S_ppm#global:scripttype)\\set_busy.js'
    );
  }

  changePosition && PPx.Execute(`*customize X_vpos=${newpos}`);
  PPx.Execute(command);
  // PPx.Execute(command + '%&');
  changePosition && PPx.Execute(`*setcust X_vpos=${savepos}`);
};

const viewer = g_args();
const used_ppv = PPx.getProcessValue('view_usedppv');
const boot_id = ((id = viewer.id) => {
  if (id === '0') {
    if (used_ppv === '') {
      return '';
    }

    id = used_ppv;
  }

  return `-r -bootid:${id.slice(-1)}`;
})();

let parent_dir = PPx.Extract('%FD');
let [file_name, file_ext] = ((reload = viewer.reload) => {
  let y, t, name;

  if (reload === '0') {
    y = PPx.Extract('%Y');
    t = PPx.Extract('%t');
    name = t !== '' ? `${y}.${t}` : y;
  } else {
    const path = PPx.Extract('%*extract(V,"%%W")').replace(
      /^PPV\[[A-Z]+\](\((Elevate|Limit)\))?(.+)/,
      '$3'
    );
    parent_dir = path.substring(0, path.lastIndexOf('\\'));
    name = path.substring(parent_dir.length + 1);
    t = name.split('.')[1] || '';
  }

  return [name, t];
})();

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
    exec_ppv(`*ppv ${boot_id} "${parent_dir}/${file_name}"`);
    break;
  case 62:
  case 63:
  case 64:
  case 96:
    exec_ppv(`*ppv ${boot_id} "${parent_dir}\\${file_name}"`);
    break;
  default:
    parent_dir = parent_dir.replace(/^aux:(\/\/)?S_[^\/\\]+[\/\\]/, '');
    if (parent_dir === '?' || parent_dir === '') {
      PPx.setPopLineMessage('!"Unknown path');
      PPx.Quit(1);
    }

    exec_ppv(cmd_line());
    used_ppv !== '' && PPx.setProcessValue('view_usedppv', '');
}
