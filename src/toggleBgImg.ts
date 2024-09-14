/* @file Toggle PPv background image */

import {useLanguage} from '@ppmdev/modules/data.ts';
import {langBackgroundImage} from './mod/language.ts';

const SE_DISABLE = 'C:\\Windows\\Media\\speech off.wav';
const SE_ENABLE = 'C:\\Windows\\Media\\speech on.wav';
const lang = langBackgroundImage[useLanguage()];

const main = (): void => {
  const ppxid = PPx.Extract('%n');
  const hasImg = PPx.Extract(`%*getcust(X_bg:T_${ppxid})`) === '1';

  if (hasImg) {
    PPx.Execute(`*deletecust X_bg:P_${ppxid}%:*deletecust X_bg:T_${ppxid}`);
    showResult(SE_DISABLE, lang.disable);
  } else {
    PPx.Execute(`*setcust X_bg:P_${ppxid}=%FDCN%:*setcust X_bg:T_${ppxid}=1`);
    showResult(SE_ENABLE, lang.enable);
  }
};

const showResult = (se: string, msg: string): void => {
  PPx.Execute(`*sound "${se}"%:*linemessage ${msg}`);
};

main();
