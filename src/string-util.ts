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

export function zeroPad(n: number | string, digits: number): string {
  const s = n.toString();

  return '0'.repeat(Math.max(0, digits - s.length)) + s;
}
