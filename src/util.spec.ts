/*
  Copyright © 2017-2020 Kerry Shetline, kerry@shetline.com

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

import { expect } from 'chai';
import { blendColors, parseColor } from './browser-graphics-util';
// import { doesCharacterGlyphExist, getFont, htmlEscape, htmlUnescape } from './browser-util';
import { DateTimeOptions, formatDateTime, last, processMillis, toBoolean, toInt } from './misc-util';
import { asLines, extendDelimited, makePlainASCII, stripLatinDiacriticals, toMixedCase } from './string-util';

describe('util', () => {
  it('should extend a string, adding delimiters where needed', () => {
    let s = '';

    s = extendDelimited(s, 'A');
    expect(s).to.equal('A');
    s = extendDelimited(s, 'B');
    expect(s).to.equal('A, B');
  });
  //
  it('should parse colors correctly', () => {
    let rgba = parseColor('yellow');
    expect(rgba.r).to.equal(255);
    expect(rgba.g).to.equal(255);
    expect(rgba.b).to.equal(0);

    rgba = parseColor('#9CF');
    expect(rgba.r).to.equal(153);
    expect(rgba.g).to.equal(204);
    expect(rgba.b).to.equal(255);

    rgba = parseColor('#8090a0');
    expect(rgba.r).to.equal(128);
    expect(rgba.g).to.equal(144);
    expect(rgba.b).to.equal(160);
  });

  // it('should blend colors correctly', () => {
  //   let color = blendColors('white', 'black');
  //   expect(color).to.equal('#808080');
  //
  //   color = blendColors('white', 'black', 0.75);
  //   expect(color).to.equal('#BFBFBF');
  //
  //   color = blendColors('rgba(20, 40, 60, 0.6)', 'rgba(40, 60, 80, 0.4)');
  //   expect(color).to.equal('rgba(30, 50, 70, 0.5)');
  // });
  //
  it('should format date/time correctly', () => {
    expect(formatDateTime()).to.match(/\d{4}-\d\d-\d\d \d\d:\d\d:\d\d [-+]\d{4}/);
    expect(formatDateTime('Fri Jun 07 2019 21:18:36 GMT-0400',
      [DateTimeOptions.USE_T, DateTimeOptions.USE_Z])).to.equal('2019-06-08T01:18:36Z');
    expect(new Date('2019-06-08 01:18:36.890Z').getTime()).to.equal(1559956716890);
    expect(formatDateTime(1559956716890,
      [DateTimeOptions.WITH_MILLIS, DateTimeOptions.USE_Z])).to.equal('2019-06-08 01:18:36.890Z');
    expect(formatDateTime([DateTimeOptions.TIME_ONLY])).to.match(/\d\d:\d\d:\d\d [-+]\d{4}/);
  });

  it('should strip diacritical marks from latin characters', () => {
    expect(stripLatinDiacriticals('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'))
      .to.equal('AAAAAAÆCEEEEIIIIÐNOOOOO×OUUUUYÞßaaaaaaæceeeeiiiiðnooooo÷ouuuuyþy');
  });

  it('should simplify symbols and latin characters to plain ASCII', () => {
    expect(makePlainASCII('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'))
      .to.equal('AAAAAAAeCEEEEIIIIDhNOOOOO_OUUUUYThssaaaaaaaeceeeeiiiidhnooooo_ouuuuythy');
    expect(makePlainASCII('Þjóð')).to.equal('Thjodh');
    expect(makePlainASCII('ÞJÓÐ')).to.equal('THJODH');
    expect(makePlainASCII('[café*]')).to.equal('[cafe*]');
    expect(makePlainASCII('[café*]', true)).to.equal('(cafe-)');
  });

  // it('should get fonts in correct shorthand form', () => {
  //   const span = document.createElement('span');
  //
  //   span.textContent = '?';
  //   span.style.font = 'bold italic 14pt "Courier New", monospace';
  //   span.style.lineHeight = '1.5em';
  //   span.style.fontStretch = '125%';
  //   document.body.appendChild(span);
  //
  //   const font = getFont(span);
  //
  //   expect(font).to.contain('italic');
  //   expect(font).to.contain('"Courier New"');
  //   expect(font).to.contain('monospace');
  //   expect(font).to.contain('expanded');
  //   expect(font).to.match(/\b18\.6\d+px\s*\/\s*28px\b/);
  //   expect(font).to.match(/\b(bold|700)\b/);
  //   document.body.removeChild(span);
  // });

  it('should accurately measure time intervals', done => {
    let start = processMillis();
    const intervals: number[] = [];
    const interval = setInterval(() => {
      intervals.push(processMillis() - start);

      if (intervals.length >= 5) {
        clearInterval(interval);
        // Allow for some outlier values caused by slowness of start-up
        expect(intervals.filter(t => (40 <= t && t <= 60)).length).to.be.gte(3);
        done();
      }

      start = processMillis();
    }, 50);
  });

  // it('should correctly identify missing character glyphs', () => {
  //   const fonts = ['12px sans-serif', '14pt monospace'];
  //
  //   for (const font of fonts) {
  //     expect(doesCharacterGlyphExist(font, 'a')).to.be.true;
  //     expect(doesCharacterGlyphExist(font, '\uFFFE')).to.be.false;
  //     expect(doesCharacterGlyphExist(font, 0x2022)).to.be.true;
  //     expect(doesCharacterGlyphExist(font, 0xFFFF)).to.be.false;
  //   }
  // });
  //
  it('should correctly convert to boolean', () => {
    expect(toBoolean('t', false)).to.be.true;
    expect(toBoolean('YES', false)).to.be.true;
    expect(toBoolean('False', true)).to.be.false;
    expect(toBoolean('n', true)).to.be.false;
    expect(toBoolean('?', true)).to.be.true;
    expect(toBoolean('?', false)).to.be.false;
    expect(toBoolean('?')).to.be.false;
    expect(toBoolean(null, true)).to.be.true;
    expect(toBoolean(undefined, true)).to.be.true;
    expect(toBoolean('')).to.be.false;
    expect(toBoolean('', true)).to.be.true;
    expect(toBoolean('', false, true)).to.be.true;
  });

  it('should correctly convert to int', () => {
    expect(toInt('-47')).to.equal(-47);
    expect(toInt('foo', 99)).to.equal(99);
    expect(toInt('1011', -1, 2)).to.equal(11);
    expect(toInt('cafebabe', -1, 16)).to.equal(3405691582);
    expect(toInt('cafegabe', -1, 16)).to.equal(-1);
  });

  it('should get last element of an array', () => {
    expect(last([1, 2, 4, -3])).to.equal(-3);
    expect(last(['alpha', 'omega'])).to.equal('omega');
    expect(last([])).to.equal(undefined);
    expect(last(null)).to.equal(undefined);
  });

  it('should split string into lines', () => {
    expect(asLines('')).to.eql([]);
    expect(asLines('no breaks')).to.eql(['no breaks']);
    expect(asLines('foo\nbar\r\nbaz\rqux')).to.eql(['foo', 'bar', 'baz', 'qux']);
    expect(asLines('The end\n')).to.eql(['The end', '']);
    expect(asLines('The\n\nend\n\n\n', true)).to.eql(['The', '', 'end']);
  });

  // it('should escape and unescape for HTML', () => {
  //   expect(htmlEscape(`2 < 3 & 5 > 4, "Don't you see?"`)).to.equal(`2 &lt; 3 &amp; 5 &gt; 4, "Don't you see?"`);
  //   expect(htmlEscape(`2 < 3 & 5 > 4, "Don't you see?"`, true))
  //     .to.equal('2 &lt; 3 &amp; 5 &gt; 4, &quot;Don&apos;t you see?&quot;');
  //   expect(htmlUnescape('2 &lt; 3 &amp; 5 &gt; 4, &quot;Don&apos;t you see?&quot; &#33 &#xB6; &unknown; &#nope; @'))
  //     .to.equal(`2 < 3 & 5 > 4, "Don't you see?" ! ¶ &unknown; &#nope; @`);
  // });

  it('should properly convert strings to mixed case', () => {
    expect(toMixedCase("isn't this working ?")).to.equal("Isn't This Working ?");
  });
});
