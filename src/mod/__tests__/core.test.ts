import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {launchPPv as core} from '../core.ts';

describe('launchPPv', function () {
  describe('susieExtensions()', function () {
    it('return value must be an array with multiple extensions', () => {
      const value = `P_susie	= {
                    iftwic.sph	= B011,*.gif;*.png;*.jpg
                    ifavif.sph	= B011,*.avif
                    }`;
      const spy = jest.spyOn(PPx, 'Extract').mockImplementation(() => value);
      expect(core.susieExtensions()).toEqual(['*.gif','*.png','*.jpg','*.avif']);
      spy.mockRestore();
    });
    it('should returned an empty array. If there is no extension', () => {
      const value = `P_susie	= {
                    iftwic.sph	= B011,
                    ifavif.sph	= B011,
                    }`;
      const spy = jest.spyOn(PPx, 'Extract').mockImplementation(() => value);
      expect(core.susieExtensions()).toEqual([]);
      spy.mockRestore();
    });
  });
});
