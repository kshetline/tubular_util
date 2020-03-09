/*
  Copyright © 2017-2019 Kerry Shetline, kerry@shetline.com

  MIT license: https://opensource.org/licenses/MIT

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
  persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
  Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { parseColor } from './browser-graphics-util';
import { doesCharacterGlyphExist, getFont } from './browser-util';
import { DateTimeOptions, formatDateTime, processMillis } from './misc-util';
import { extendDelimited, makePlainASCII, stripLatinDiacriticals } from './string-util';

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

  it('should format date/time correctly', () => {
    expect(formatDateTime()).toMatch(/\d{4}-\d\d-\d\d \d\d:\d\d:\d\d [-+]\d{4}/);
    expect(formatDateTime('Fri Jun 07 2019 21:18:36 GMT-0400',
      [DateTimeOptions.USE_T, DateTimeOptions.USE_Z])).toEqual('2019-06-08T01:18:36Z');
    expect(new Date('2019-06-08 01:18:36.890Z').getTime()).toEqual(1559956716890);
    expect(formatDateTime(1559956716890,
      [DateTimeOptions.WITH_MILLIS, DateTimeOptions.USE_Z])).toEqual('2019-06-08 01:18:36.890Z');
    expect(formatDateTime([DateTimeOptions.TIME_ONLY])).toMatch(/\d\d:\d\d:\d\d [-+]\d{4}/);
  });

  it('should strip diacritical marks from latin characters', () => {
    expect(stripLatinDiacriticals('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'))
      .toEqual('AAAAAAÆCEEEEIIIIÐNOOOOO×OUUUUYÞßaaaaaaæceeeeiiiiðnooooo÷ouuuuyþy');
  });

  it('should simplify symbols and latin characters to plain ASCII', () => {
    expect(makePlainASCII('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'))
      .toEqual('AAAAAAAeCEEEEIIIIDhNOOOOO_OUUUUYThssaaaaaaaeceeeeiiiidhnooooo_ouuuuythy');
    expect(makePlainASCII('Þjóð')).toEqual('Thjodh');
    expect(makePlainASCII('ÞJÓÐ')).toEqual('THJODH');
    expect(makePlainASCII('[café*]')).toEqual('[cafe*]');
    expect(makePlainASCII('[café*]', true)).toEqual('(cafe-)');
  });

  it('should get fonts in correct shorthand form', () => {
    const span = document.createElement('span');

    span.textContent = '?';
    span.style.font = 'bold italic 14pt "Courier New", monospace';
    span.style.lineHeight = '1.5em';
    span.style.fontStretch = '125%';
    document.body.appendChild(span);

    const font = getFont(span);

    expect(font).toContain('italic');
    expect(font).toContain('"Courier New"');
    expect(font).toContain('monospace');
    expect(font).toContain('expanded');
    expect(font).toMatch(/\b18\.6\d+px\s*\/\s*28px\b/);
    expect(font).toMatch(/\b(bold|700)\b/);
    document.body.removeChild(span);
  });

  it('should accurately measure time intervals', done => {
    const start = processMillis();

    setTimeout(() => {
      const time = processMillis() - start;

      expect(40 <= time && time <= 60).toBeTruthy();
      done();
    }, 50);
  });

  it('should correctly identify missing character glyphs', () => {
    const fonts = ['12px sans-serif', '14pt monospace'];

    for (const font of fonts) {
      expect(doesCharacterGlyphExist(font, 'a')).toBeTruthy();
      expect(doesCharacterGlyphExist(font, '\uFFFE')).toBeFalsy();
      expect(doesCharacterGlyphExist(font, 0x2022)).toBeTruthy();
      expect(doesCharacterGlyphExist(font, 0xFFFF)).toBeFalsy();
    }
  });
});
