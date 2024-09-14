/* @file Open the file specified dy PPv
 * @arg 0 {number} - Specify the CompleteList match option. default value is 3
 * @arg 1 {string} - Specify the ID of PPc
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {tmp, useLanguage} from '@ppmdev/modules/data.ts';
import debug from '@ppmdev/modules/debug.ts';
import fso, {copyFile} from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {readLines} from '@ppmdev/modules/io.ts';
import {pathSelf} from '@ppmdev/modules/path.ts';
import {ppm} from '@ppmdev/modules/ppm.ts';
import {expandSource} from '@ppmdev/modules/source.ts';
import {langOpenArchDoc} from './mod/language.ts';

const PLUGIN_NAME = 'ppm-view';

const {scriptName} = pathSelf();
const fileName = `${scriptName.slice(0, scriptName.lastIndexOf('.'))}`;
const LISTFILE_EXT = 'xlf';
const COMP_LIST_PATH = `${tmp().ppmDir()}\\${fileName}.${LISTFILE_EXT}`;

const lang = langOpenArchDoc[useLanguage()];

const main = () => {
  const [matchOpt, ppcid] = validArgs();
  const userConfigPath = PPx.Extract(`%sgu'ppmcache'\\list\\${fileName}.txt`);
  const title = fileName;
  const waitEdit = `*edit "${userConfigPath}"`;
  let isInitailRun = false;

  if (!fso.FileExists(userConfigPath)) {
    const repoDir = expandSource(PLUGIN_NAME)?.path;

    if (!repoDir) {
      ppm.echo(title, lang.couldNotFind);

      return;
    }

    copyFile(`${repoDir}\\sheet\\${fileName}.txt`, userConfigPath);
    !ppm.question(title, lang.needToWrite) && PPx.Quit(-1);
    PPx.Execute(waitEdit);
    isInitailRun = true;
  }

  const [error, data] = readLines({path: userConfigPath, enc: 'utf8'});

  if (error) {
    PPx.linemessage(`${lang.couldNotRead} "%%'ppmcache'\\list\\${fileName}.txt"`);

    return;
  }

  type UserSpec = {masks: string; paths: string[]};
  const userSpec: UserSpec = {masks: '', paths: []};

  for (const line of data.lines) {
    if (line.indexOf(';') === 0 || /^\s*$/.test(line)) {
      continue;
    } else if (line.indexOf('>') === 0) {
      userSpec.masks = line.slice(1);

      continue;
    }

    userSpec.paths.push(line);
  }

  if (userSpec.paths.length === 0) {
    ppm.echo(title, lang.noCandidates);

    return;
  }

  const pathSpec = userSpec.paths.join(';');
  createCompList(pathSpec, userSpec.masks, isInitailRun);

  const infoUpdate = `*linemessage ${lang.updating}`;
  ppm.setkey('F5', `%(${infoUpdate}%:${whereis(pathSpec, userSpec.masks)}%:*linemessage%:*completelist -file:"${COMP_LIST_PATH}"%)`);
  ppm.setkey('^O', `%(%"${title}"%Q"${lang.startEdit}"%:${waitEdit}%:${infoUpdate}%:%k"F5"%)`);

  const [errorlevel, filepath] = ppm.getinput({
    title,
    mode: 'e',
    leavecancel: false,
    autoselect: true,
    k: `*completelist -list -match:${matchOpt} -module:off -detail:"user1" -file:"${COMP_LIST_PATH}"`
  });
  ppm.deletekeys();

  if (errorlevel !== 0) {
    return;
  }

  if (!isEmptyStr(ppcid)) {
    const id = PPx.Extract('%n').slice(-1);
    const update = ~ppm.extract(`C${ppcid}`, '%%FDV')[1].indexOf(COMP_LIST_PATH) ? '-update' : '';
    const notRunning = isEmptyStr(ppm.extract(`C${ppcid}`, '%%n')[1]);
    notRunning ? PPx.Execute(`*ppc -selectnoactive -bootid:${ppcid}`) : ppm.execute('C', `*pane select C${ppcid}`);

    ppm.execute(
      'C',
      `%(%Oa *jumppath ${update} "${COMP_LIST_PATH}::listfile" -entry:"${filepath}"` +
        `%:*if 0==0%*extract(C,"%%*js(""PPx.result=PPx.SyncView;"")")%:*ppvoption id ${id}"%:%K-C"@N"%)`
    );
  } else {
    PPx.Execute(`%v"${filepath}"`);
  }
};

const whereis = (paths: string, exts: string): string =>
  `%*extract(C,"%(*whereis -listfile:"${COMP_LIST_PATH}" -path:"${paths}" -mask:"${exts}" -vfs -search -name%:%)")`;
const createCompList = (paths: string, exts: string, isFirstRun: boolean): void => {
  if (fso.FileExists(COMP_LIST_PATH)) {
    const st = fso.GetFile(COMP_LIST_PATH);
    const lastModDate = st.DateLastModified;
    const currentDate = new Date();
    const DAY_MS = 86400000;

    if (!isFirstRun && Number(currentDate) - Number(lastModDate) - DAY_MS < 0) {
      return;
    }
  }

  PPx.Extract(whereis(paths, exts));
};

main();
