import { extendDelimited, parseColor, urlEncodeParams } from './ks-util';

describe('ks-util', () => {
  it('should extend a string, adding delimiters where needed', () => {
    let s = '';

    s = extendDelimited(s, 'A');
    expect(s).toEqual('A');
    s = extendDelimited(s, 'B');
    expect(s).toEqual('A, B');
  });

  it('should parse colors correctly', () => {
    let rgba = parseColor('yellow');
    expect(rgba.r).toEqual(255);
    expect(rgba.g).toEqual(255);
    expect(rgba.b).toEqual(0);

    rgba = parseColor('#9CF');
    expect(rgba.r).toEqual(153);
    expect(rgba.g).toEqual(204);
    expect(rgba.b).toEqual(255);

    rgba = parseColor('#8090a0');
    expect(rgba.r).toEqual(128);
    expect(rgba.g).toEqual(144);
    expect(rgba.b).toEqual(160);
  });

  it ('should encode URL params correctly', () => {
    const params = {a: 'foo', b: 'bar', c: '#stuff?', d: null, e: undefined};
    expect(urlEncodeParams(params)).toEqual('a=foo&b=bar&c=%23stuff%3F');
  });
});
