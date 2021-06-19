import { compareStrings, zeroPad } from './string-util';

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

export function first<T>(array: ArrayLike<T>): T {
  if (isArrayLike(array) && array.length > 0)
    return array[0];
  else
    return undefined;
}

export function nth<T>(array: ArrayLike<T>, index: number): T {
  if (isArrayLike(array) && array.length > index)
    return array[index];
  else
    return undefined;
}

export function last<T>(array: ArrayLike<T>): T {
  if (isArrayLike(array) && array.length > 0)
    return array[array.length - 1];
  else
    return undefined;
}

export function push<T>(array: T[], ...items): T[] {
  array.push(...items);
  return array;
}

export function pushIf<T>(condition: boolean, array: T[], ...items): T[] {
  if (condition)
    array.push(...items);

  return array;
}

export function forEach<T>(obj: { [key: string]: T }, callback: (key: string, value: T) => void): void {
  Object.keys(obj).forEach(key => callback(key, obj[key]));
}

export function isArray(a: any): a is any[] {
  return Array.isArray(a);
}

/* eslint-disable no-prototype-builtins */
export function isArrayLike(a: any): a is ArrayLike<any> {
  return Array.isArray(a) || a instanceof Array || (isObject(a) && isNumber((a as any).length) &&
      (a as any).length >= 0 && (a as any).length <= Number.MAX_SAFE_INTEGER && (a as any).length === Math.floor((a as any).length));
}

export function isBigint(a: any): a is boolean {
  return typeof a === 'bigint';
}

export function isBoolean(a: any): a is boolean {
  return typeof a === 'boolean';
}

export function isFunction(a: any): a is Function {
  return typeof a === 'function';
}

export function isNonFunctionObject(a: any): a is Exclude<Record<string | number | symbol, any>, Function> {
  return a && typeof a === 'object';
}

export function isNumber(a: any): a is number {
  return typeof a === 'number';
}

export function isObject(a: any): a is Record<string | number | symbol, any> {
  return a && (typeof a === 'function' || typeof a === 'object');
}

export function isString(a: any): a is string {
  return typeof a === 'string';
}

export function isSymbol(a: any): a is symbol {
  return typeof a === 'symbol';
}

export function classOf(a: any, noClassResult = false): string {
  if (isObject(a)) {
    if (a.constructor?.name)
      return a.constructor.name;
    else
      return noClassResult ? 'no-class:object' : null;
  }

  return noClassResult ? 'no-class:' + typeof a : null;
}

export function clone<T>(orig: T, shallow: boolean | Set<any> | ((value: any, depth: number) => boolean) = false): T {
  return cloneAux(orig, shallow, 0, new WeakMap<any, any>());
}

function cloneAux<T>(orig: T, shallow: boolean | Set<any> | ((value: any, depth: number) => boolean), depth: number,
                     hash: WeakMap<any, any>): T {
  if (isFunction(orig) || !isObject(orig) || (shallow === true && depth > 0))
    return orig;
  else if (hash.has(orig))
    return hash.get(orig);
  else if (shallow && depth > 0) {
    if (shallow instanceof Set) {
      for (const qlass of shallow.values()) {
        if (orig instanceof qlass)
          return orig;
      }
    }
    else if (isFunction(shallow) && shallow(orig, depth))
      return orig;
  }

  let theClone: any;

  if (orig instanceof Date)
    theClone = new Date(orig);
  else if (orig instanceof RegExp)
    theClone = new RegExp(orig);
  else if (orig instanceof Map) {
    theClone = new Map();
    hash.set(orig, theClone);
    Array.from(orig.entries()).forEach(entry => theClone.set(entry[0], cloneAux(entry[1], shallow, depth + 1, hash)));

    return theClone;
  }
  else if (orig instanceof Set) {
    theClone = new Set();
    hash.set(orig, theClone);
    orig.forEach(item => theClone.add(cloneAux(item, shallow, depth + 1, hash)));

    return theClone;
  }
  else if (typeof BigInt64Array !== 'undefined' && orig instanceof BigInt64Array)
    theClone = new BigInt64Array(orig);
  else if (typeof BigUint64Array !== 'undefined' && orig instanceof BigUint64Array)
    theClone = new BigUint64Array(orig);
  else if (orig instanceof Float32Array)
    theClone = new Float32Array(orig);
  else if (orig instanceof Float64Array)
    theClone = new Float64Array(orig);
  else if (orig instanceof Int8Array)
    theClone = new Int8Array(orig);
  else if (orig instanceof Int16Array)
    theClone = new Int8Array(orig);
  else if (orig instanceof Int32Array)
    theClone = new Int8Array(orig);
  else if (orig instanceof Uint8Array)
    theClone = new Uint8Array(orig);
  else if (orig instanceof Uint16Array)
    theClone = new Uint8Array(orig);
  else if (orig instanceof Uint32Array)
    theClone = new Uint8Array(orig);
  else if (orig instanceof Uint8ClampedArray)
    theClone = new Uint8ClampedArray(orig);

  if (theClone) {
    hash.set(orig, theClone);

    return theClone;
  }

  const qlass = classOf(orig);

  if (qlass != null && qlass !== 'Array') {
    theClone = Object.create(Object.getPrototypeOf(orig));

    if (isArray(orig))
      theClone.length = orig.length;
  }
  else if (isArray(orig)) {
    theClone = [];
    theClone.length = orig.length;
  }
  else
    theClone = {};

  hash.set(orig, theClone);

  const keys = Object.keys(orig);

  for (const key of keys)
    theClone[key] = cloneAux(orig[key], shallow, depth + 1, hash);

  return theClone;
}

export function isEqual(a: any, b: any, mustBeSameClass = false): boolean {
  if (a === b || Object.is(a, b))
    return true;
  else if (typeof a !== typeof b || isArray(a) !== isArray(b))
    return false;
  else if (mustBeSameClass && (!a.constructor !== !b.constructor || a.constructor !== b.constructor))
    return false;
  else if (isArray(a) && a.length === b.length) {
    for (let i = 0; i < a.length; ++i) {
      if (a.hasOwnProperty(i)) {
        if (!b.hasOwnProperty(i) || !isEqual(a[i], b[i], mustBeSameClass))
          return false;
      }
      else if (b.hasOwnProperty(i))
        return false;
    }
  }
  else if (!isObject(a) || !isObject(b))
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

function _flatten(result: any[], source: any[], depth: number): any[] {
  for (const item of source) {
    if (depth === 0 || !isArray(item))
      result.push(item);
    else
      _flatten(result, item, depth - 1);
  }

  return result;
}

export function flatten(a: any[]): any[] {
  return _flatten([], a, 1);
}

export function flattenDeep(a: any[]): any[] {
  return _flatten([], a, Number.MAX_SAFE_INTEGER);
}

type EntrySorter = (a: [number | string | symbol, any], b: [number | string | symbol, any]) => number;
const defaultSorter: EntrySorter = (a, b) => compareStrings(a[0].toString(), b[0].toString());

export function sortObjectEntries<T>(obj: T, inPlace?: boolean): T;
export function sortObjectEntries<T>(obj: T, sorter?: EntrySorter, inPlace?: boolean);
export function sortObjectEntries<T>(obj: T, sorterOrInPlace?: boolean | EntrySorter, inPlace = false): T {
  const sorter = isFunction(sorterOrInPlace) ? sorterOrInPlace : undefined;
  let result: T = {} as any;
  const entries = Object.entries(obj);

  inPlace = isBoolean(sorterOrInPlace) ? sorterOrInPlace : inPlace;
  entries.sort(sorter ?? defaultSorter);

  if (inPlace) {
    Object.keys(obj).forEach(key => delete obj[key]);
    result = obj;
  }

  entries.forEach(entry => result[entry[0]] = entry[1]);

  return result;
}

export const noop = (..._args: any[]): void => {};

export const repeat = (n: number, f: (n?: number) => any): void => { while (n-- > 0) f(n); };
