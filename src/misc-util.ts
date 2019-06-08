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

import { zeroPad } from './string-util';

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

export function toBoolean(str, defaultValue?: boolean): boolean {
  if (/^(true|t|yes|y)$/i.test(str))
    return true;
  else if (/^(false|f|no|n)$/i.test(str))
    return false;

  const n = Number(str);

  if (!isNaN(n))
    return n !== 0;

  return defaultValue;
}
