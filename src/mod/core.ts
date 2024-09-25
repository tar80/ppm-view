import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {ppvMediaType} from '@ppmdev/modules/meta.ts';
import {runStdout} from '@ppmdev/modules/run.ts';

export const STAYMODE_ID = 80120;
export const WORKER_NAME = 'workerPPv';
export const WORKER_FILENAME = `${WORKER_NAME}.stay.js`;
export const SYNTAX_SCRIPT_NAME = 'getSyntaxDocument.js';

const composeCmdline = (id: string, path: string, opts: string[] = []): string => {
  const bootid = id !== '0' ? `-r -bootid:${id.slice(-1)}` : '-r';

  return [bootid, `"${path}"`, ...opts].join(' ');
};

export const susieExtensions = (): string[] => {
  const table = PPx.Extract('%*getcust(P_susie)').toLowerCase();
  const rgx = /\*\.\w+/gm;

  return table.match(rgx) || [];
};

type MediaKeys = keyof typeof ppvMediaType;
type MediaType = (typeof ppvMediaType)[MediaKeys];
const expandExt = <FileType extends string>(path: string, fileExt: FileType): [FileType, MediaType] => {
  const validExt = PPx.GetFileInformation(path);
  let mediaType = ppvMediaType[validExt as MediaKeys];

  if (mediaType === 'javascript' || mediaType === 'perl' || mediaType === 'cmd' || mediaType === 'json') {
    return [mediaType as FileType, mediaType];
  } else if (mediaType !== 'image') {
    const susieExts: string[] = susieExtensions();
    const currentExt = validExt.toLowerCase().replace(':', '*.');

    if (~susieExts.indexOf(currentExt)) {
      mediaType = 'image';
    }
  }

  return [fileExt, mediaType];
};

const buildBatCommandWithNkf = (fileName: string, fileType: string, userOptions: string, codepage?: string): string[] => {
  const FIXED_OPTIONS = '--paging=never --color=always --style=changes --wrap=never';
  const OPT_UTF8 = '-utf8';
  const preOpt = '%Obd';
  const batCmd = `bat ${FIXED_OPTIONS} ${userOptions}`;
  const output = "%si'TempFile' 2>&1";
  const optFileType = !isEmptyStr(fileType) ? ` -l ${fileType}` : '';
  const guessEnc = runStdout({hide: true, trim: true, cmdline: `nkf -g "${fileName}"`})[1];
  const batOutput = `${preOpt} ${batCmd}${optFileType} "${fileName}" >${output}`;
  const convUtf16 = `${preOpt} nkf -W16L -w16L "${fileName}" | ${batCmd}${optFileType} >${output}`;
  const convGuess = `${preOpt} nkf --ic=${guessEnc} -w "${fileName}" | ${batCmd} ${optFileType} >${output}`;
  const isNonText = guessEnc === 'ASCII' || guessEnc === 'BINARY';

  if (codepage) {
    if (isNonText && codepage === 'UTF8') {
      return [OPT_UTF8, batOutput];
    }

    if (codepage === 'SJIS') {
      const output = isNonText ? batOutput : convGuess;

      return [OPT_UTF8, output];
    }

    if (isNonText && codepage === 'UNICODE') {
      return [OPT_UTF8, convUtf16];
    }
  }

  if (guessEnc === 'UTF-8' || guessEnc === 'UTF-16') {
    return [OPT_UTF8, batOutput];
  } else if (!isNonText) {
    return [OPT_UTF8, convGuess];
  }

  return ['', ''];
};

export const selectionAt = (): {col: number; forward: string; backward: string} => {
  const col = Number(PPx.Extract('%lH')) - 1;
  const selectText = PPx.Extract('%*selecttext()').replace(/\t/g, ' ');
  const forward = selectText.slice(0, col);
  const backward = selectText.slice(col);

  return {col, forward, backward};
};

export const rgxSelection = {
  prefix: /^(.*[\/\\\t\s\.,"'`\()<>\[\]\{}])(.*)$/,
  suffix: /^([^\/\\\t\s\.,"'`\()<>\[\]\{}]+).*$/,
  all: /^[\/\\\t\s"'`<(\[\{)]*([^\s"'`>)\]}]+).*$/
};

export const extractWord = (): string => {
  const {forward, backward} = selectionAt();

  return /^\s*$/.test(forward)
    ? backward.replace(rgxSelection.all, '$1')
    : `${forward.replace(rgxSelection.prefix, '$2')}${backward.replace(rgxSelection.suffix, '$1')}`;
};

export const caretInlineMatch = (matchIdx: number, isPrev: boolean): void => {
  if (isPrev) {
    matchIdx = -matchIdx;
  }

  PPx.Execute(`*cursor 4,${matchIdx}`);
};

export const caretMatchWord = (word: string, reverse: boolean): void => {
  const text = PPx.Extract('%*selecttext()').toLowerCase();
  const method = reverse ? 'lastIndexOf' : 'indexOf';
  const matchIdx = text[method](word.toLowerCase());

  if (matchIdx === -1) {
    return;
  }

  const currentCol = Number(PPx.Extract('%lH'));
  PPx.Execute(`*cursor 4,${matchIdx - currentCol + 1}`);
};

export const debugMsg = (debugMode: string, msg: string): void => {
  debugMode === 'DEBUG' && PPx.Execute(`*execute C,*linemessage [DEBUG] ${msg}`);
};

export const launchPPv = {composeCmdline, expandExt, buildBatCommandWithNkf};
