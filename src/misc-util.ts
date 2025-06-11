import { asLines, compareStrings, zeroPad } from './string-util';

export interface IsEqualOptions {
  compare?: (a: any, b: any, key?: string | Symbol | undefined) => boolean | undefined;
  keysToIgnore?: Set<string | symbol> | string[];
  mustBeSameClass?: boolean;
}

/* istanbul ignore next */
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

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export enum DateTimeOptions { DATE_ONLY, NO_SECONDS, NO_ZONE, TIME_ONLY, UTC, USE_T, USE_Z, WITH_MILLIS }

export function formatDateTime(options?: DateTimeOptions[]): string;
export function formatDateTime(date: Date | number | string, ...options: DateTimeOptions[]): string;
export function formatDateTime(date: Date | number | string, options?: DateTimeOptions[]): string;
export function formatDateTime(dateOrOptions: Date | number | string | DateTimeOptions[] | null | undefined, finalArg?: any): string {
  let date: Date | undefined;
  let dateOnly = false;
  let timeOnly = false;
  let noSeconds = false;
  let noZone = false;
  let utc = false;
  let useT = false;
  let useZ = false;
  let withMillis = false;
  let options: DateTimeOptions[] | undefined;

  if (Array.isArray(dateOrOptions))
    options = dateOrOptions;
  else if (arguments.length > 1 && isNumber(finalArg))
    options = Array.from(arguments).slice(1); // eslint-disable-line prefer-rest-params
  else if (isArray(finalArg))
    options = finalArg;

  if (typeof dateOrOptions === 'number' || typeof dateOrOptions === 'string')
    date = new Date(dateOrOptions);

  date = date ?? new Date();

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
  const zoneMinutes = utc ? 0 : date.getTimezoneOffset();
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

export function numSort(a: any, b: any): number {
  return toNumber(a) - toNumber(b);
}

export function reverseNumSort(a: any, b: any): number {
  return toNumber(b) - toNumber(a);
}

export function toDefaultLocaleFixed(n: number, minFracDigits?: number, maxFracDigits?: number): string {
  const options: any = {};

  if (minFracDigits !== undefined)
    options.minimumFractionDigits = minFracDigits;

  if (maxFracDigits !== undefined)
    options.maximumFractionDigits = maxFracDigits;

  return n.toLocaleString(undefined, options);
}

export function toBoolean(value: any, defaultValue?: boolean, forHtmlAttribute?: boolean): boolean;
export function toBoolean(value: any, defaultValue: null, forHtmlAttribute?: boolean): boolean | null;
export function toBoolean<T>(value: any, defaultValue: boolean | T = false, forHtmlAttribute = false): boolean | T {
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
  else if (/^(true|t|yes|y)$/i.test(value) || (defaultValue && value === ''))
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

export function toInt(value: any, defaultValue?: number, radix?: number): number;
export function toInt(value: any, defaultValue: null, radix?: number): number | null;
export function toInt<T>(value: any, defaultValue: number | T = 0, radix = 10): number | T {
  if (typeof value === 'number')
    return isNaN(value) || !isFinite(value) ? defaultValue : Math.floor(value);
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

export function toValidInt(value: any, defaultValue = 0, radix = 10): number {
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value)))
    return defaultValue;
  else
    return toInt(value, defaultValue, radix);
}

export function toNumber(value: any, defaultValue?: number): number;
export function toNumber(value: any, defaultValue: null): number | null;
export function toNumber<T>(value: any, defaultValue: number | T | undefined = 0): number | T {
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

    if (!isFinite(result))
      return defaultValue;
    else
      return result;
  }
  else
    return defaultValue;
}

export function toValidNumber(value: any, defaultValue = 0): number {
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value)))
    return defaultValue;
  else
    return toNumber(value, defaultValue);
}

export function first<T>(array: ArrayLike<T> | null | undefined, defaultValue?: T): T | undefined {
  if (isArrayLike(array) && array.length > 0)
    return array[0];
  else
    return defaultValue;
}

export function nth<T>(array: ArrayLike<T> | null | undefined, n: number, defaultValue?: T): T | undefined {
  if (isArrayLike(array) && array.length + (n < 0 ? 1 : 0) > Math.abs(n))
    return n < 0 ? array[array.length + n] : array[n];
  else
    return defaultValue;
}

export function last<T>(array: ArrayLike<T> | null | undefined, defaultValue?: T): T | undefined {
  if (isArrayLike(array) && array.length > 0)
    return array[array.length - 1];
  else
    return defaultValue;
}

export function push<T>(array: T[] | null | undefined, ...items: any[]): T[] {
  if (!array)
    array = [];

  array.push(...items);
  return array;
}

export function pushIf<T>(condition: boolean, array: T[] | null | undefined, ...items: any[]): T[] {
  if (!array)
    array = [];

  if (condition)
    array.push(...items);

  return array;
}

export function forEach<T>(obj: Record<string, T> | null | undefined, callback: (key: string, value: T) => void): void {
  Object.keys(isObject(obj) ? obj : {}).forEach(key => callback(key, obj![key]));
}

export function forEach2<T>(obj: Record<string | symbol, T> | null | undefined, callback: (key: string | symbol, value: T) => void): void {
  Reflect.ownKeys(isObject(obj) ? obj : {}).forEach(key => callback(key, obj![key]));
}

export function isArray(a: unknown): a is any[] {
  return Array.isArray(a);
}

export function nfe<T>(array: T[]): T[] | null { // Null For Empty
  if (array && isArray(array) && array.length > 0)
    return array;
  else
    return null;
}

export function ufe<T>(array: T[]): T[] | undefined { // Undefined For Empty
  if (array && isArray(array) && array.length > 0)
    return array;
  else
    return undefined;
}

export function getOrSet<T, U>(map: Map<T, U>, key: T, callbackOrValue: U | (() => U)): U {
  let result = map.get(key);

  if (result === undefined) {
    if (isFunction(callbackOrValue))
      result = callbackOrValue();
    else
      result = callbackOrValue;

    map.set(key, result);
  }

  return result;
}

export async function getOrSetAsync<T, U>(map: Map<T, U>, key: T, callback: () => Promise<U>): Promise<U> {
  let result = map.get(key);

  if (result === undefined) {
    result = await callback();
    map.set(key, result);
  }

  return result;
}

/* eslint-disable no-prototype-builtins */
export function isArrayLike(a: unknown): a is ArrayLike<any> {
  return Array.isArray(a) || a instanceof Array || (isObject(a) && isNumber((a as any).length) &&
      (a as any).length >= 0 && (a as any).length <= Number.MAX_SAFE_INTEGER && (a as any).length === Math.floor((a as any).length));
}

export function isBigint(a: unknown): a is bigint {
  return typeof a === 'bigint';
}

export function isBoolean(a: unknown): a is boolean {
  return typeof a === 'boolean';
}

export function isFunction(a: unknown): a is Function {
  return typeof a === 'function';
}

export function isNonFunctionObject(a: unknown): a is Exclude<Record<string | symbol, any>, Function> {
  return !!a && typeof a === 'object';
}

export function isNumber(a: unknown): a is number {
  return typeof a === 'number';
}

export function isObject(a: unknown): a is Record<string | symbol, any> {
  return !!a && (typeof a === 'function' || typeof a === 'object');
}

export function isString(a: unknown): a is string {
  return typeof a === 'string';
}

export function isSymbol(a: unknown): a is symbol {
  return typeof a === 'symbol';
}

export function classOf(a: unknown, noClassResult = false): string | null {
  if (isObject(a))
    return a.constructor.name;
  else
    return noClassResult ? 'no-class:' + typeof a : null;
}

export function clone<T>(orig: T, shallow: boolean | Set<any> | ((value: any, depth: number) => boolean) = false): T {
  return cloneAux(orig, shallow, 0, new WeakMap<any, any>());
}

function cloneAux<T>(orig: T, shallow: boolean | Set<Function> | ((value: any, depth: number) => boolean), depth: number,
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
    theClone = new Int16Array(orig);
  else if (orig instanceof Int32Array)
    theClone = new Int32Array(orig);
  else if (orig instanceof Uint8Array)
    theClone = new Uint8Array(orig);
  else if (orig instanceof Uint16Array)
    theClone = new Uint16Array(orig);
  else if (orig instanceof Uint32Array)
    theClone = new Uint32Array(orig);
  else if (orig instanceof Uint8ClampedArray)
    theClone = new Uint8ClampedArray(orig);

  if (theClone) {
    hash.set(orig, theClone);

    return theClone;
  }

  const qlass = classOf(orig);

  if (qlass != null && qlass !== 'Array' && qlass !== 'Object') {
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

  const keys = Reflect.ownKeys(orig as any);

  for (const key of keys)
    theClone[key] = cloneAux((orig as any)[key], shallow, depth + 1, hash);

  return theClone;
}

export function isEqual(a: any, b: any, options: boolean | IsEqualOptions = false, key?: string | symbol): boolean {
  if (isBoolean(options))
    options = { mustBeSameClass: options };

  if (isArray(options?.keysToIgnore))
    options.keysToIgnore = new Set(options.keysToIgnore);

  let comp: boolean | undefined;

  if (options.compare && (comp = options.compare(a, b, key)) !== undefined)
    return comp;
  else if (key && options.keysToIgnore && options.keysToIgnore.has(key))
    return true;
  else if (a === b || Object.is(a, b))
    return true;
  else if (typeof a !== typeof b || isArray(a) !== isArray(b) || (isArray(a) && a.length !== b.length))
    return false;
  else if (options.mustBeSameClass && (!a.constructor !== !b.constructor || a.constructor !== b.constructor))
    return false;
  else if (!isObject(a) || !isObject(b))
    return false;
  else {
    const keys = Reflect.ownKeys(a);
    const keysB = new Set(Reflect.ownKeys(b));

    for (const key of keys) {
      keysB.delete(key);

      if (options?.keysToIgnore && options.keysToIgnore.has(key))
        continue;

      if (!b.hasOwnProperty(key) || !isEqual(a[key], b[key], options, key))
        return false;
    }

    if (keysB.size > 0 && options?.keysToIgnore)
      options.keysToIgnore.forEach(key => keysB.delete(key));

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

export type EntrySorter = (a: [string | symbol, any], b: [string | symbol, any]) => number;
const defaultSorter: EntrySorter = (a, b) => compareStrings(a[0].toString(), b[0].toString());

export function sortObjectEntries<T>(obj: T, inPlace?: boolean): T;
export function sortObjectEntries<T>(obj: T, sorter?: EntrySorter, inPlace?: boolean): T;
export function sortObjectEntries<T>(obj: T, sorterOrInPlace?: boolean | EntrySorter, inPlace = false): T {
  const sorter = isFunction(sorterOrInPlace) ? sorterOrInPlace : undefined;
  let result: T = {} as any;
  // @ts-ignore
  const entries = Object.entries(obj);

  inPlace = isBoolean(sorterOrInPlace) ? sorterOrInPlace : inPlace;
  entries.sort(sorter ?? defaultSorter);

  if (inPlace) {
    // @ts-ignore
    Object.keys(obj).forEach(key => delete (obj as any)[key]); // @ts-ignore:this-line
    result = obj;
  }

  entries.forEach(entry => (result as any)[entry[0]] = entry[1]);

  return result;
}

/* istanbul ignore next */ // noinspection JSUnusedGlobalSymbols
export const noop = (..._args: any[]): void => {};

export const repeat = (n: number, f: (n?: number) => any): void => { while (n-- > 0) f(n); };

export function isValidJson(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  }
  catch {}

  return false;
}

export function keyCount(obj: any): number {
  return obj ? Reflect.ownKeys(obj).length : 0;
}

// Intended to be used as a tag function.
export function regex(main: TemplateStringsArray, flags?: string): RegExp {
  const parts = asLines(main.raw[0], true, true).filter(line => !line.startsWith('//')).map(line => line.replace(/\s\/\/\s.*$/, ''));

  return new RegExp(parts.join(''), flags);
}

export function compareDottedValues(a: string, b: string): number {
  if ((!a && !b) || a === b)
    return 0;

  // Lop off strings, starting at any non-numeric, non-dot characters
  a = a.replace(/[-_]/g, '.').replace(/[^.0-9].*$/, '');
  b = b.replace(/[-_]/g, '.').replace(/[^.0-9].*$/, '');

  while (a.length > 0 && b.length > 0) {
    let pos = a.indexOf('.');
    let na: number;
    let nb: number;

    if (pos < 0) {
      na = toInt(a);
      a = '';
    }
    else {
      na = toInt(a.substring(0, pos));
      a = a.substring(pos + 1);
    }

    pos = b.indexOf('.');

    if (pos < 0) {
      nb = toInt(b);
      b = '';
    }
    else {
      nb = toInt(b.substring(0, pos));
      b = b.substring(pos + 1);
    }

    if (na < nb)
      return -1;
    else if (na > nb)
      return 1;
  }

  if (!a)
    return -1;
  else
    return 1;
}

export type TbuAnyFunction = (...args: any[]) => any | void;

export function debounce<F extends TbuAnyFunction>(delay: number, func: F, callback?: (result: ReturnType<F>) => void):
    (...args: Parameters<F>) => void {
  let timer: any;

  return function (...args: Parameters<F>): void {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const result = func.apply(this, args);

      if (callback)
        callback(result);
    }, delay);
  };
}

export function throttle<F extends TbuAnyFunction>(delay: number, func: F, callback?: (result: ReturnType<F>) => void):
    (...args: Parameters<F>) => void {
  const trailing = (delay < 0);
  let timer: any;
  let pendingArgs: any;

  const callFunc = (args: any) => {
    const result = func.apply(this, args);

    if (callback)
      callback(result);

    timer = setTimeout(() => {
      timer = undefined;

      if (pendingArgs) {
        args = pendingArgs;
        pendingArgs = undefined;
        callFunc(args);
      }
    }, Math.abs(delay));
  };

  return function (...args: Parameters<F>): void {
    if (!timer)
      callFunc(args);
    else if (trailing)
      pendingArgs = args;
  };
}
