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

import { zeroPad } from './string-util';

export function processMillis(): number {
  if (typeof performance !== 'undefined')
    return performance.now();
  else if (typeof process !== 'undefined') {
    if ((process.hrtime as any).bigint)
      return Number((process.hrtime as any).bigint()) / 1000000;
    else {
      const time = process.hrtime();

      return time[0] * 1000 + time[1] / 1000000;
    }
  }
  else
    return Date.now();
}

export enum DateTimeOptions { DATE_ONLY, NO_SECONDS, NO_ZONE, TIME_ONLY, UTC, USE_T, USE_Z, WITH_MILLIS }

export function formatDateTime(options?: DateTimeOptions[]): string;
export function formatDateTime(date: Date | number | string, options?: DateTimeOptions[]): string;
export function formatDateTime(dateOrOptions: Date | number | string | DateTimeOptions[], options?: DateTimeOptions[]): string {
  let date: Date;
  let dateOnly = false;
  let timeOnly = false;
  let noSeconds = false;
  let noZone = false;
  let utc = false;
  let useT = false;
  let useZ = false;
  let withMillis = false;

  if (!dateOrOptions)
    date = new Date();
  else if (Array.isArray(dateOrOptions)) {
    date = new Date();
    options = dateOrOptions;
  }
  else if (typeof dateOrOptions === 'number' || typeof dateOrOptions === 'string')
    date = new Date(dateOrOptions);
  else
    date = dateOrOptions;

  if (options) {
    options.forEach(option => {
      switch (option) {
        case DateTimeOptions.DATE_ONLY: dateOnly = true; break;
        case DateTimeOptions.NO_SECONDS: noSeconds = true; withMillis = false; break;
        case DateTimeOptions.NO_ZONE: noZone = true; break;
        case DateTimeOptions.TIME_ONLY: timeOnly = true; break;
        case DateTimeOptions.UTC: utc = true; break;
        case DateTimeOptions.USE_T: useT = true; break;
        case DateTimeOptions.USE_Z: useZ = true; utc = true; break;
        case DateTimeOptions.WITH_MILLIS: withMillis = true; noSeconds = false; break;
      }
    });
  }

  const y = zeroPad(utc ? date.getUTCFullYear() : date.getFullYear(), 4);
  const M = zeroPad(utc ? date.getUTCMonth() + 1 : date.getMonth() + 1, 2);
  const d = zeroPad(utc ? date.getUTCDate() : date.getDate(), 2);
  const dateStr = `${y}-${M}-${d}`;

  if (dateOnly)
    return dateStr;

  const h = zeroPad(utc ? date.getUTCHours() : date.getHours(), 2);
  const t = (useT ? 'T' : ' ');
  const m = zeroPad(utc ? date.getMinutes() : date.getUTCMinutes(), 2);
  const s = ':' + zeroPad(utc ? date.getUTCSeconds() : date.getSeconds(), 2);
  const x = '.' + zeroPad(utc ? date.getUTCMilliseconds() : date.getMilliseconds(), 3);
  const zoneMinutes = date.getTimezoneOffset();
  const z = useZ ? 'Z' :
    ' ' + (zoneMinutes > 0 ? '-' : '+') + zeroPad(Math.floor(Math.abs(zoneMinutes) / 60), 2) + zeroPad(Math.floor(Math.abs(zoneMinutes) % 60), 2);
  let timeStr = `${h}:${m}`;

  if (!noSeconds)
    timeStr += s;

  if (withMillis)
    timeStr += x;

  if (!noZone)
    timeStr += z;

  if (timeOnly)
    return timeStr;
  else
    return dateStr + t + timeStr;
}

export function toDefaultLocaleFixed(n: number, minFracDigits?: number, maxFracDigits?: number): string {
  const options: any = {};

  if (minFracDigits !== undefined)
    options.minimumFractionDigits = minFracDigits;

  if (maxFracDigits !== undefined)
    options.maximumFractionDigits = maxFracDigits;

  return n.toLocaleString(undefined, options);
}

export function toBoolean(value, defaultValue = false, forHtmlAttribute = false): boolean {
  if (typeof value === 'boolean')
    return value;
  else if (value == null)
    return defaultValue;
  else if (typeof value === 'number')
    return isNaN(value) ? defaultValue : value !== 0;
  else if (typeof value !== 'string')
    return !!value;
  else if (forHtmlAttribute && value === '')
    return true;
  else if (/^(true|t|yes|y)$/i.test(value) || defaultValue && value === '')
    return true;
  else if (/^(false|f|no|n)$/i.test(value))
    return false;

  const n = Number(value);

  return isNaN(n) ? defaultValue : n !== 0;
}

const digitMatchers: RegExp[] = [];

for (let radix = 2; radix <= 36; ++radix) {
  if (radix <= 10)
    digitMatchers[radix] = new RegExp('^[-+]?[0-' + (radix - 1) + ']+$');
  else
    digitMatchers[radix] = new RegExp('^[-+]?[0-9A-' + String.fromCharCode(54 + radix) + ']+$', 'i');
}

export function toInt(value: any, defaultValue = 0, radix = 10): number {
  if (typeof value === 'number')
    return Math.floor(value);
  else if (typeof value === 'string') {
    const matcher = digitMatchers[radix];

    // Let's be stricter than parseInt and allow only signs and valid base digits.
    if (!matcher || !matcher.test(value))
      return defaultValue;

    const result = parseInt(value, radix);

    if (isNaN(result) || !isFinite(result))
      return defaultValue;
    else
      return result;
  }
  else if (typeof value === 'bigint') {
    const result = Number(value);

    if (isNaN(result) || !isFinite(result))
      return defaultValue;
    else
      return result;
  }
  else
    return defaultValue;
}

export function toNumber(value: any, defaultValue = 0): number {
  if (typeof value === 'number')
    return value;
  else if (typeof value === 'string') {
    const result = parseFloat(value);

    if (isNaN(result) || !isFinite(result))
      return defaultValue;
    else
      return result;
  }
  else if (typeof value === 'bigint') {
    const result = Number(value);

    if (isNaN(result) || !isFinite(result))
      return defaultValue;
    else
      return result;
  }
  else
    return defaultValue;
}

export function last<T>(array: Array<T>): T {
  if (Array.isArray(array) && array.length > 0)
    return array[array.length - 1];
  else
    return undefined;
}

export function forEach<T>(obj: { [key: string]: T }, callback: (key: string, value: T) => void): void {
  Object.keys(obj).forEach(key => callback(key, obj[key]));
}

export function isArray(a: any): boolean {
  return Array.isArray(a);
}

/* eslint-disable no-prototype-builtins */
export function isArrayLike(a: any): boolean {
  return Array.isArray(a) || (isObject(a) && isNumber(a.length) && a.length >= 0 && a.length <= Number.MAX_SAFE_INTEGER &&
    a.length === Math.floor(a.length));
}

export function isBoolean(a: any): boolean {
  return typeof a === 'boolean';
}

export function isFunction(a: any): boolean {
  return typeof a === 'function';
}

export function isNonFunctionObject(a: any): boolean {
  return a && typeof a === 'object';
}

export function isNumber(a: any): boolean {
  return typeof a === 'number';
}

export function isObject(a: any): boolean {
  return a && (typeof a === 'function' || typeof a === 'object');
}

export function isString(a: any): boolean {
  return typeof a === 'string';
}

export function isSymbol(a: any): boolean {
  return typeof a === 'symbol';
}

export function clone(a: any): any {
  if (isFunction(a) || !isObject(a))
    return a;

  if (isArray(a)) {
    const c = [];

    c.length = a.length;

    for (let i = 0; i < a.length; ++i) {
      if (a.hasOwnProperty(i))
        c[i] = clone(a[i]);
    }

    return c;
  }

  const c = {};
  const keys = Object.keys(a);

  for (const key of keys)
    c[key] = clone(a[key]);

  return c;
}

export function isEqual(a: any, b: any, mustBeSameClass = false): boolean {
  if (a === b || Object.is(a, b))
    return true;
  else if (typeof a !== typeof b || isArray(a) !== isArray(b))
    return false;
  else if (mustBeSameClass && (!a.constructor !== !b.constructor || a.constructor !== b.constructor))
    return false;
  else if (isArray(a)) {
    for (let i = 0; i < a.length; ++i) {
      if (a.hasOwnProperty(i)) {
        if (!b.hasOwnProperty(i) || !isEqual(a[i], b[i], mustBeSameClass))
          return false;
      }
      else if (b.hasOwnProperty(i))
        return false;
    }
  }
  else if (!isObject(a))
    return false;
  else {
    const keys = Object.keys(a);
    const keysB = new Set(Object.keys(b));

    for (const key of keys) {
      keysB.delete(key);

      if (!b.hasOwnProperty(key) || !isEqual(a[key], b[key], mustBeSameClass))
        return false;
    }

    if (keysB.size > 0)
      return false;
  }

  return true;
}
