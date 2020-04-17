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

import { last } from './misc-util';

export function asLines(s: string, trimFinalBlankLines = false): string[] {
  if (s) {
    const lines = s.split(/\r\n|\r|\n/);

    while (trimFinalBlankLines && last(lines) === '')
      lines.pop();

    return lines;
  }
  else
    return [];
}

export function compareCaseInsensitive(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();

  return (a < b ? -1 : (a > b ? 1 : 0));
}

export function compareCaseSecondary(a: string, b: string): number {
  const a1 = a.toLowerCase();
  const b1 = b.toLowerCase();
  const result = (a1 < b1 ? -1 : (a1 > b1 ? 1 : 0));

  if (result !== 0)
    return result;

  return (a < b ? -1 : (a > b ? 1 : 0));
}

export function compareStrings(a: string, b: string): number {
  return (a < b ? -1 : (a > b ? 1 : 0));
}

export function extendDelimited(base: string, newItem: string, delimiter = ', '): string {
  if (!base)
    return newItem;
  else
    return base + delimiter + newItem;
}

const diacriticals = '\u00C0\u00C1\u00C2\u00C3\u00C4\u00C5\u00C7\u00C8\u00C9\u00CA\u00CB\u00CC' +
                     '\u00CD\u00CE\u00CF\u00D1\u00D2\u00D3\u00D4\u00D5\u00D6\u00D8\u00D9\u00DA' +
                     '\u00DB\u00DC\u00DD\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5\u00E7\u00E8\u00E9' +
                     '\u00EA\u00EB\u00EC\u00ED\u00EE\u00EF\u00F1\u00F2\u00F3\u00F4\u00F5\u00F6' +
                     '\u00F8\u00F9\u00FA\u00FB\u00FC\u00FD\u00FF' +
                     '\u00AD\u00B4\u00B7\u2022' + // soft hyphen, acute accent, middle dot, bullet
                     '\u2010\u2011\u2012\u2013' + // hyphen, no-break hyphen, figure dash, en dash
                     '\u2018\u2019\u201A\u201B' + // left single quote, right single quote, single low-9 quote, single high reversed-9 single quote
                     '\u201C\u201D\u201F\u201C' + // left double quote, right double quote, double low-9 quote, double high reversed-9 single quote
                     '\u2024\u2027\u2032\u2033' + // One dot leader, hyphenation point, prime, double prime
                     '\u2039\u203A\u2044';        // left single angle quote, right single angle quote, fraction slash
const plainChars = 'AAAAAACEEEEI' +
                   'IIINOOOOOOUU' +
                   'UUYaaaaaacee' +
                   'eeiiiinooooo' +
                   'ouuuuyy' +
                   "-'**" +
                   '----' +
                   "''''" +
                   '""""' +
                   `.-'"` +
                   '<>/';
const latinExtendedASubstitutions = 'AaAaAaCcCcCcCcDdDdEeEeEeEeEeGgGgGgGgHhHhIiIiIiIiIi--JjKkkLlLlLlL' +
                                    'lLlNnNnNnn--OoOoOo--RrRrRrSsSsSsSsTtTtTtUuUuUuUuUuUuWwYyYZzZzZzs';

export function makePlainASCII(s: string, forFileName = false): string {
  if (!s)
    return s;

  let needsWork = false;

  for (let i = 0; i < s.length && !needsWork; ++i) {
    const cc = s.charCodeAt(i);
    const ch = s.charAt(i);

    if (cc < 32 || cc > 126 ||
        (forFileName && (ch === '"' || ch === '[' || ch === ']' || ch === '*' ||
                         ch === '/' || ch === ':' || ch === ';' || ch === '<' ||
                         ch === '>' || ch === '?' || ch === '\\' || ch === '|' ||
                         (i === 0 && ch === '.'))))
      needsWork = true;
  }

  if (!needsWork)
    return s;

  const sb: string[] = [];
  const allUpper = (s === s.toUpperCase());

  for (let i = 0; i < s.length; ++i) {
    let ch = s.charAt(i);
    let pos: number;
    let ch2;

    if (forFileName) {
      if      (ch === '"')
        ch = "'";
      else if (ch === '[')
        ch = '(';
      else if (ch === ']')
        ch = ')';
      else if (ch === '*')
        ch = '-';
      else if (ch === '/' || ch === ':' || ch === ';' || ch === '<' ||
               ch === '>' || ch === '?' || ch === '\\' || ch === '|' ||
               (i === 0 && ch === '.'))
        ch = '_';
    }

    const cc = ch.charCodeAt(0);

    if (32 <= cc && cc <= 126)
      {} // Do nothing
    else if (cc === 0xC6) // Latin capital letter AE
      ch2 = 'Ae';
    else if (cc === 0xD0) // Latin capital letter Eth
      ch2 = 'Dh';
    else if (cc === 0xDE) // Latin capital letter Thorn
      ch2 = 'Th';
    else if (cc === 0xDF) // Latin small letter sharp s
      ch2 = 'ss';
    else if (cc === 0xE6) // Latin small letter ae
      ch2 = 'ae';
    else if (cc === 0xF0) // Latin capital letter eth
      ch2 = 'dh';
    else if (cc === 0xFE) // Latin small letter thorn
      ch2 = 'th';
    else if (cc === 0xA9 && !forFileName) // Copyright
      ch2 = '(c)';
    else if (cc === 0xAB && !forFileName) // Left-pointing double angle quotation
      ch2 = '<<';
    else if (cc === 0xAE && !forFileName) // Registered sign
      ch2 = '(R)';
    else if (cc === 0xB1 && !forFileName) // plus-minus sign
      ch2 = '+/-';
    else if (cc === 0xBB && !forFileName) // Right-pointing double angle quotation
      ch2 = '>>';
    else if (cc === 0x0132) // Latin capital ligature IJ
      ch2 = 'Ij';
    else if (cc === 0x0133) // Latin small ligature ij
      ch2 = 'ij';
    else if (cc === 0x014A) // Latin capital letter Eng
      ch2 = 'Ng';
    else if (cc === 0x014B) // Latin small letter eng
      ch2 = 'ng';
    else if (cc === 0x0152) // Latin capital ligature OE
      ch2 = 'Oe';
    else if (cc === 0x0153) // Latin small ligature oe
      ch2 = 'oe';
    else if (0x100 <= cc && cc <= 0x17F) // Various Latin Extended A
      ch = latinExtendedASubstitutions.charAt(cc - 0x100);
    else if ((cc === 0x2014 || cc === 0x2015) && !forFileName) // em dash, horizontal bar
      ch2 = '--';
    else if ((cc === 0x2014 || cc === 0x2015) && !forFileName) // em dash, horizontal bar
      ch2 = '--';
    else if (cc === 0x2026 && !forFileName) // ellipsis
      ch2 = '...';
    else if ((pos = diacriticals.indexOf(ch)) >= 0)
      ch  = plainChars.charAt(pos);
    else if (0x0300 <= cc && cc <= 0x036F)
      ch2 = ''; // Omit combining diacritical marks
    else
      ch  = '_';

    if (ch2 === undefined)
      sb.push(ch);
    else {
      if (allUpper)
        ch2 = ch2.toUpperCase();

      sb.push(ch2);
    }
  }

  return sb.join('');
}

export function makePlainASCII_lc(s: string): string {
  if (s)
    return makePlainASCII(s).toLowerCase();
  else
    return s;
}

export function makePlainASCII_UC(s: string): string {
  if (s)
    return makePlainASCII(s).toUpperCase();
  else
    return s;
}

export function padLeft(item: string | number, length: number, padChar = ' '): string {
  let sign = '';

  if (typeof item === 'number' && (item as number) < 0 && padChar === '0') {
    sign = '-';
    item = -item;
    --length;
  }

  let result = String(item);

  while (result.length < length) {
    result = padChar + result;
  }

  return sign + result;
}

export function padRight(item: string, length: number, padChar?: string): string {
  if (!padChar) {
    padChar = ' ';
  }

  while (item.length < length) {
    item += padChar;
  }

  return item;
}

export function replace(str: string, searchStr: string, replaceStr: string, caseInsensitive = false): string {
  // escape regexp special characters in search string
  searchStr = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  return str.replace(new RegExp(searchStr, 'g' + (caseInsensitive ? 'i' : '')), replaceStr);
}

export function stripLatinDiacriticals(s: string): string {
  if (!s)
    return s;

  let needsWork = false;

  for (let i = 0; i < s.length && !needsWork; ++i) {
    if (s.charCodeAt(i) >= 0xC0)
      needsWork = true;
  }

  if (!needsWork)
    return s;

  const sb: string[] = [];

  for (let i = 0; i < s.length; ++i) {
    const cc = s.charCodeAt(i);
    const ch = s.charAt(i);
    let ch2;
    let pos: number;

    if (cc < 0xC0)
      {} // Do nothing
    else if (0x100 <= cc && cc <= 0x17F) { // Various Latin Extended A
      ch2 = latinExtendedASubstitutions.charAt(cc - 0x100);

      if (ch2 === '-')
        ch2 = undefined;
    }
    else if ((pos = diacriticals.indexOf(ch)) >= 0) {
      ch2 = plainChars.charAt(pos);

      if (!/[a-z]/i.test(ch2))
        ch2 = undefined;
    }
    else if (0x0300 <= cc && cc <= 0x036F)
      continue; // Omit combining diacritical marks

    if (ch2)
      sb.push(ch2);
    else
      sb.push(ch);
  }

  return sb.join('');
}

export function stripLatinDiacriticals_lc(s: string): string {
  if (s)
    return stripLatinDiacriticals(s).toLowerCase();
  else
    return s;
}

export function stripLatinDiacriticals_UC(s: string): string {
  if (s)
    return stripLatinDiacriticals(s).toUpperCase();
  else
    return s;
}

export function zeroPad(n: number | string, digits: number): string {
  const s = n.toString();

  return '0'.repeat(Math.max(0, digits - s.length)) + s;
}
