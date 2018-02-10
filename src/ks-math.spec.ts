import * as M_ from './ks-math';

describe('ks-math', () => {
  it('should perform integer division, rounding down', () => {
    expect(M_.div_rd(5, 3)).toEqual(1);
    expect(M_.div_rd(-5, 3)).toEqual(-2);
  });

  it('should perform integer division, truncating toward 0', () => {
    expect(M_.div_tt0(5, 3)).toEqual(1);
    expect(M_.div_tt0(-5, 3)).toEqual(-1);
  });
});
