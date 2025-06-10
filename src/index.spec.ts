import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { encodeForUri, htmlEscape, htmlUnescape, urlEncodeParams } from './browser-util';
import {
  classOf, clone, compareDottedValues, DateTimeOptions, debounce, first, flatten, flattenDeep, forEach, forEach2,
  formatDateTime, getOrSet, getOrSetAsync, isArray, isArrayLike, isBigint, isBoolean, isEqual, isFunction,
  isNonFunctionObject, isNumber, isObject, isString, isSymbol, isValidJson, keyCount, last, nfe, nth, numSort,
  processMillis, push, pushIf, regex, repeat, reverseNumSort, sleep, sortObjectEntries, throttle, toBoolean,
  toDefaultLocaleFixed, toInt, toNumber, toValidInt, toValidNumber, ufe
} from './misc-util';
// noinspection JSDeprecatedSymbols
import {
  asLines, checksum53, compareCaseInsensitive, compareCaseSecondary, compareStrings, convertDigits,
  convertDigitsToAscii, digitScript, extendDelimited, isAllUppercase, isAllUppercaseWords, isDigit, makePlainASCII,
  makePlainASCII_lc, makePlainASCII_UC, padLeft, padRight, regexEscape, replace, stripDiacriticals,
  stripDiacriticals_lc, stripDiacriticals_UC, stripLatinDiacriticals, stripLatinDiacriticals_lc,
  stripLatinDiacriticals_UC, toMaxFixed, toMaxSignificant, toMixedCase, toTitleCase
} from './string-util';
import * as util from './index';

chai.use(chaiAsPromised);
(globalThis as any).util = util;

class TestClass {
  array: number[];

  constructor(public a: number, public b: number) {
    this.array = [a, b];
  }

  sum(): number {
    return this.a + this.b;
  }
}

class TestClass2 extends Array<number> {
  constructor(public name: string, a: number, b: number) {
    super();
    this.push(a);
    this.push(b);
  }

  sum(): number {
    return this.reduce((a, b) => a + b);
  }
}

class TestClass3 extends TestClass {
  constructor(public a: number, public b: number) {
    super(a, b);
  }
}

function isGoodLocale(): boolean {
  const sample1 = Math.PI.toLocaleString([], { minimumFractionDigits: 9 });
  const sample2 = (Math.PI * 1E9).toLocaleString([], { maximumFractionDigits: 0 });

  return /\./.test(sample1) && !/[ ,]/.test(sample1) && /,/.test(sample2) && !/[ .]/.test(sample2);
}

describe('@tubular/util', () => {
  it('should extend a string, adding delimiters where needed', () => {
    let s = '';

    s = extendDelimited(s, 'A');
    expect(s).to.equal('A');
    s = extendDelimited(s, 'B');
    expect(s).to.equal('A, B');
  });

  it('should format date/time correctly', () => {
    expect(formatDateTime()).to.match(/\d{4}-\d\d-\d\d \d\d:\d\d:\d\d [-+]\d{4}/);
    expect(formatDateTime('Fri Jun 07 2019 21:18:36 GMT-0400',
      [DateTimeOptions.USE_T, DateTimeOptions.USE_Z])).to.equal('2019-06-08T01:18:36Z');
    expect(formatDateTime('Fri Jun 07 2019 21:18:36 GMT-0400',
      [DateTimeOptions.USE_T, DateTimeOptions.UTC, DateTimeOptions.NO_ZONE])).to.equal('2019-06-08T01:18:36');
    expect(new Date('2019-06-08 01:18:36.890Z').getTime()).to.equal(1559956716890);
    expect(formatDateTime(1559956716890,
      [DateTimeOptions.WITH_MILLIS, DateTimeOptions.USE_Z])).to.equal('2019-06-08 01:18:36.890Z');
    expect(formatDateTime(1559956716890,
      [DateTimeOptions.WITH_MILLIS, DateTimeOptions.USE_Z, DateTimeOptions.USE_T])).to.equal('2019-06-08T01:18:36.890Z');
    expect(formatDateTime(1559956716890,
      DateTimeOptions.WITH_MILLIS, DateTimeOptions.USE_Z)).to.equal('2019-06-08 01:18:36.890Z');
    expect(formatDateTime(1559956716890,
      DateTimeOptions.WITH_MILLIS, DateTimeOptions.USE_T, DateTimeOptions.USE_Z)).to.equal('2019-06-08T01:18:36.890Z');
    expect(formatDateTime([DateTimeOptions.TIME_ONLY])).to.match(/\d\d:\d\d:\d\d [-+]\d{4}/);
    expect(formatDateTime([DateTimeOptions.TIME_ONLY, DateTimeOptions.NO_SECONDS])).to.match(/\d\d:\d\d [-+]\d{4}/);
    expect(formatDateTime([DateTimeOptions.TIME_ONLY, DateTimeOptions.NO_SECONDS, DateTimeOptions.NO_ZONE])).to.match(/\d\d:\d\d/);
    expect(formatDateTime([DateTimeOptions.DATE_ONLY])).to.match(/\d\d\d\d-\d\d-\d\d/);
  });

  it('string comparison', () => {
    expect(compareStrings('foo', 'foo')).to.equal(0);
    expect(compareStrings('foo', 'bar')).to.equal(1);
    expect(compareStrings('foo', 'quux')).to.equal(-1);
    expect(compareCaseInsensitive('foo', 'FOO')).to.equal(0);
    expect(compareCaseInsensitive('foo', 'BAR')).to.equal(1);
    expect(compareCaseInsensitive('FOO', 'quux')).to.equal(-1);
    expect(compareCaseSecondary('foo', 'foo')).to.equal(0);
    expect(compareCaseSecondary('foo', 'FOO')).to.equal(1);
    expect(compareCaseSecondary('FOO', 'foo')).to.equal(-1);
    expect(compareCaseSecondary('foo', 'bar')).to.equal(1);
    expect(compareCaseSecondary('foo', 'quux')).to.equal(-1);
  });

  /* cSpell:disable */
  it('should strip diacritical marks from Latin characters', () => {
    expect(stripLatinDiacriticals('')).to.equal('');
    expect(stripLatinDiacriticals('xyz')).to.equal('xyz');
    // noinspection SpellCheckingInspection
    expect(stripLatinDiacriticals('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĤĥ̊u\u2010'))
      .to.equal('AAAAAAÆCEEEEIIIIÐNOOOOO×OUUUUYÞßaaaaaaæceeeeiiiiðnooooo÷ouuuuyþyHhu\u2010');
    expect(stripLatinDiacriticals_lc('')).to.equal('');
    expect(stripLatinDiacriticals_lc('ÐÑÒ')).to.equal('ðno');
    expect(stripLatinDiacriticals_UC('')).to.equal('');
    expect(stripLatinDiacriticals_UC('çèé')).to.equal('CEE');
  });

  it('should strip diacritical marks from Latin and non-Latin characters', () => {
    // noinspection SpellCheckingInspection
    expect(stripDiacriticals('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿΆΈΪΫάέήίΰϊϋόύώϔӐӑӒӓӖӗЀйѐёіїќ'))
      .to.equal('AAAAAAÆCEEEEIIIIÐNOOOOO×OUUUUYÞßaaaaaaæceeeeiiiiðnooooo÷ouuuuyþyΑΕΙΥαεηιυιυουωϒАаАаЕеЕиееіік');
    expect(stripDiacriticals('')).to.equal('');
    expect(stripDiacriticals('Á b')).to.equal('A b');
    expect(stripDiacriticals_lc('')).to.equal('');
    expect(stripDiacriticals_lc('Á b')).to.equal('a b');
    expect(stripDiacriticals_UC('')).to.equal('');
    expect(stripDiacriticals_UC('Á b')).to.equal('A B');
  });

  it('should simplify symbols and Latin characters to plain ASCII', () => {
    expect(makePlainASCII(null as any)).to.equal(null);
    expect(makePlainASCII('abc')).to.equal('abc');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('©«®±»ĲĳŊŋŒœĀ—―…̃x')).to.equal('(c)<<(R)+/->>IjijNgngOeoeA----...x');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'))
      .to.equal('AAAAAAAeCEEEEIIIIDhNOOOOO_OUUUUYThssaaaaaaaeceeeeiiiidhnooooo_ouuuuythy');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('Þjóð')).to.equal('Thjodh');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('ÞJÓÐ')).to.equal('THJODH');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII_lc('ÞJÓÐ')).to.equal('thjodh');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII_UC('[café*]')).to.equal('[CAFE*]');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('[café*]', true)).to.equal('(cafe-)');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII_UC('.[café*]"/:;<>?\\|', true)).to.equal('_(CAFE-)\'________');
    expect(makePlainASCII_lc(null as any)).to.equal(null);
    expect(makePlainASCII_UC('')).to.equal('');
  });
  /* cSpell:enable */

  it('should accurately measure time intervals', done => {
    let start = processMillis();
    const intervals: number[] = [];
    const interval = setInterval(() => {
      const now = processMillis();
      intervals.push(now - start);

      if (intervals.length >= 7) {
        clearInterval(interval);
        // Allow for some outlier values caused by slowness of start-up
        expect(intervals.filter(t => t >= 80 && t <= 120).length).to.be.greaterThan(4);
        done();
      }

      start = now;
    }, 100);
  });

  it('toDefaultLocaleFixed', () => {
    // Skip these tests if the default locale doesn't match expectations.
    if (!isGoodLocale())
      return;

    expect(toDefaultLocaleFixed(3)).to.equal('3');
    expect(toDefaultLocaleFixed(Math.PI)).to.equal('3.142');
    expect(toDefaultLocaleFixed(3, 2)).to.equal('3.00');
    expect(toDefaultLocaleFixed(Math.PI, 2, 2)).to.equal('3.14');
    expect(toDefaultLocaleFixed(3, 2, 5)).to.equal('3.00');
    expect(toDefaultLocaleFixed(Math.PI, 2, 5)).to.equal('3.14159');
    expect(toDefaultLocaleFixed(-Math.PI, 2, 5)).to.equal('-3.14159');
    expect(toDefaultLocaleFixed(Math.PI * 1E9, 2, 2)).to.equal('3,141,592,653.59');
  });

  it('should correctly convert to boolean', () => {
    expect(toBoolean(true)).to.be.true;
    expect(toBoolean('t')).to.be.true;
    expect(toBoolean('true')).to.be.true;
    expect(toBoolean('TRUE')).to.be.true;
    expect(toBoolean('Yes')).to.be.true;
    expect(toBoolean('', true)).to.be.true;
    expect(toBoolean(42)).to.be.true;
    expect(toBoolean(42n)).to.be.true;
    expect(toBoolean(Number.NaN, true)).to.be.true;
    expect(toBoolean({})).to.be.true;
    expect(toBoolean('', false, true)).to.be.true;
    expect(toBoolean(false)).to.be.false;
    expect(toBoolean('F')).to.be.false;
    expect(toBoolean('FALSE')).to.be.false;
    expect(toBoolean('false')).to.be.false;
    expect(toBoolean('nope')).to.be.false;
    expect(toBoolean(0)).to.be.false;
    expect(toBoolean(undefined)).to.be.false;
    expect(toBoolean(null, false, true)).to.be.false;
    expect(toBoolean('')).to.be.false;
  });

  it('should correctly convert to int', () => {
    expect(toInt('-47')).to.equal(-47);
    expect(toInt('--47')).to.equal(0);
    expect(toInt(-47n)).to.equal(-47);
    expect(toInt('foo', 99)).to.equal(99);
    expect(toInt(Number.NaN, 99)).to.equal(99);
    expect(toInt('8'.repeat(350), 9999)).to.equal(9999);
    expect(toInt(BigInt('8'.repeat(350)), 9999)).to.equal(9999);
    expect(toInt('1011', -1, 2)).to.equal(11);
    expect(toInt('cafebabe', -1, 16)).to.equal(3405691582);
    /* cSpell:disable-next-line */ // noinspection SpellCheckingInspection
    expect(toInt('cafegabe', -1, 16)).to.equal(-1);
    expect(toInt({})).to.equal(0);
  });

  it('should get first, last, nth element of an array', () => {
    const a = [1.1, 2, 4, -3];

    expect(first(a)).to.equal(1.1);
    expect(first(null, 88)).to.equal(88);
    expect(last(a)).to.equal(-3);
    expect(nth(a, 2)).to.equal(4);
    expect(nth(a, -1)).to.equal(-3);
    expect(nth(a, -4)).to.equal(1.1);
    expect(nth(a, 10)).to.equal(undefined);
    expect(nth(a, -10)).to.equal(undefined);
    expect(nth(a, 10, 7)).to.equal(7);
    expect(last(['alpha', 'omega'])).to.equal('omega');
    expect(last([])).to.equal(undefined);
    expect(last([], 'foo')).to.equal('foo');
    expect(last(null)).to.equal(undefined);
  });

  it('should split string into lines', () => {
    expect(asLines('')).to.eql([]);
    expect(asLines('no breaks')).to.eql(['no breaks']);
    /* cSpell:disable-next-line */
    expect(asLines('foo\nbar\r\nbaz\rqux')).to.eql(['foo', 'bar', 'baz', 'qux']);
    expect(asLines('The end\n')).to.eql(['The end', '']);
    expect(asLines('The\n\nend\n\n\n', true)).to.eql(['The', '', 'end']);
  });

  it('should escape and unescape for HTML', () => {
    expect(htmlEscape(`2 < 3 & 5 > 4, "Don't you see?"`)).to.equal(`2 &lt; 3 &amp; 5 &gt; 4, "Don't you see?"`);
    expect(htmlEscape(`2 < 3 & 5 > 4, "Don't you see?"`, true))
      .to.equal('2 &lt; 3 &amp; 5 &gt; 4, &quot;Don&apos;t you see?&quot;');
    expect(htmlUnescape('2 &lt; 3 &amp; 5 &gt; 4, &quot;Don&apos;t you see?&quot; &#33 &#xB6; &unknown; &#nope; @'))
      .to.equal(`2 < 3 & 5 > 4, "Don't you see?" ! ¶ &unknown; &#nope; @`);
  });

  it('should properly encode URL parameters', () => {
    expect(urlEncodeParams({ foo: 22, bar: false, baz: 'M&M', nil: null })).to.equal('foo=22&bar=false&baz=M%26M');
  });

  it('should properly convert strings to mixed case', () => {
    expect(toMixedCase("isn't this working?")).to.equal("Isn't This Working?");
    expect(toMixedCase('ISN’T THIS WORKING?')).to.equal('Isn’t This Working?');
    expect(toMixedCase('one two-three 4x j99')).to.equal('One Two-Three 4X J99');
  });

  it('should properly convert strings to title case', () => {
    expect(toTitleCase('this')).to.equal('This');
    expect(toTitleCase("isn't this (working)?")).to.equal("Isn't This (Working)?");
    /* cspell:disable-next-line */ // noinspection SpellCheckingInspection
    expect(toTitleCase('íSN’T THIS WÖRKING?')).to.equal('Ísn’t This Wörking?');
    expect(toTitleCase('read ’em and weep', { shortSmall: ["'em"] })).to.equal('Read ’em and Weep');
    expect(toTitleCase('from the ’ëarth to the moon')).to.equal('From the ’Ëarth to the Moon');
    expect(toTitleCase('YOUR NEW IPHONE')).to.equal('Your New iPhone');
    expect(toTitleCase('born in the usa', { special: ['USA'] })).to.equal('Born in the USA');
    expect(toTitleCase('born in the USA', { keepAllCaps: true })).to.equal('Born in the USA');
    expect(toTitleCase("born in the ol' USA", { keepAllCaps: true, shortSmall: ['-in', "ol'"] })).to.equal("Born In the ol' USA");
    expect(toTitleCase('sitting on the dock of the ebay', { special: ['-eBay'] })).to.equal('Sitting on the Dock of the Ebay');
  });

  it('should properly detect uppercase strings and words', () => {
    expect(isAllUppercase('FooBar')).to.be.false;
    expect(isAllUppercase('FOOBAR')).to.be.true;
    expect(isAllUppercase('FOO BAR BAZ, 123')).to.be.false;
    expect(isAllUppercaseWords('FooBar')).to.be.false;
    expect(isAllUppercaseWords('FOOBAR')).to.be.true;
    expect(isAllUppercaseWords('FOO BAR BAZ, 123')).to.be.true;
    expect(isAllUppercaseWords('FOO BaR BAZ, 123')).to.be.false;
  });

  it('should pad numbers properly', () => {
    expect(padLeft(-5, 4)).to.equal('  -5');
    expect(padLeft(5, 4)).to.equal('   5');
    expect(padLeft(-5, 4, '0')).to.equal('-005');
  });

  it('padRight', () => {
    // noinspection JSDeprecatedSymbols
    expect(padRight('dye', 7)).to.equal('dye    ');
  });

  it('replace', () => {
    expect(replace('tra lA la', 'la', 'LA')).to.equal('tra lA LA');
    expect(replace('tra lA la', 'la', 'LA', true)).to.equal('tra LA LA');
  });

  it('should properly recognize data types', () => {
    expect(isArray(5)).to.be.false;
    expect(isArray('foo')).to.be.false;

    expect(isArrayLike(-7)).to.be.false;
    expect(isArrayLike([-7])).to.be.true;

    expect(isBoolean(-7)).to.be.false;
    expect(isBoolean(false)).to.be.true;

    expect(isFunction(-7)).to.be.false;
    expect(isFunction(() => 'bar')).to.be.true;
    expect(isFunction(Math.sin)).to.be.true;

    expect(isNonFunctionObject(Math.PI)).to.be.false;
    expect(isNonFunctionObject({})).to.be.true;
    expect(isNonFunctionObject(() => 'bar')).to.be.false;
    expect(isNonFunctionObject('baz')).to.be.false;

    expect(isNumber(Math.PI)).to.be.true;
    expect(isNumber(() => 'bar')).to.be.false;
    expect(isNumber(NaN)).to.be.true;

    expect(isBigint(Math.PI)).to.be.false;
    expect(isBigint(7506n)).to.be.true;

    expect(isObject(Math.PI)).to.be.false;
    expect(isObject({})).to.be.true;
    expect(isObject(() => 'bar')).to.be.true;
    expect(isObject('baz')).to.be.false;

    expect(isString(Math.PI)).to.be.false;
    expect(isString('bar')).to.be.true;
    expect(isString(NaN)).to.be.false;

    expect(isSymbol(Math.PI)).to.be.false;
    expect(isSymbol(Symbol('bar'))).to.be.true;
  });

  it('should properly get class names', () => {
    expect(classOf(3)).to.equal(null);
    expect(classOf(3, true)).to.equal('no-class:number');
    expect(classOf(new Date())).to.equal('Date');
    expect(classOf(new TestClass(44, 55))).to.equal('TestClass');
    expect(classOf(41.3, true)).to.equal('no-class:number');
    expect(classOf({}, true)).to.equal('Object');
  });

  it('should properly deep clone values', () => {
    expect(clone(5)).to.equal(5);
    expect(clone('it')).to.equal('it');
    expect(clone(false)).to.equal(false);
    expect(clone({ a: 5, b: { c: -7 } })).to.eql({ a: 5, b: { c: -7 } });
    expect(clone([1, 2, [3, 4]])).to.eql([1, 2, [3, 4]]);

    const orig = new TestClass(2, 3);
    const instanceClone = clone(orig);

    expect(instanceClone.sum()).to.equal(5);
    expect(classOf(instanceClone)).to.equal('TestClass');
    orig.array[0] = -7;
    expect(instanceClone.array[0]).to.eql(2);

    const orig2 = new TestClass2('foo', 2, 3);
    const instanceClone2 = clone(orig2);

    expect(instanceClone2.name).to.equal('foo');
    expect(instanceClone2.sum()).to.equal(5);
    expect(classOf(instanceClone2)).to.equal('TestClass2');
    orig2[0] = -7;
    expect(instanceClone2.sum()).to.equal(5);

    expect(clone(new Date('2021-04-01T12:34Z')).toISOString()).to.equal('2021-04-01T12:34:00.000Z');
    expect(clone(new Set([2, 78])).has(78)).to.be.true;
    expect(clone(new Map([[2, 78]])).get(2)).to.equal(78);
    expect(clone(new Float32Array([1.25]))[0]).to.equal(1.25);
    expect(clone(new Float64Array([-0.02]))[0]).to.equal(-0.02);
    expect(clone(new Uint8ClampedArray([3, 400]))[1]).to.equal(255);

    const recurse = new Set<any>([1, 2]);

    recurse.add([recurse]);
    expect(clone(recurse)).to.eql(recurse);
    expect(isEqual(recurse, recurse)).to.be.true;

    const sample = { date: new Date(), foo: 5 };

    expect(clone(sample).date).not.to.equal(sample.date);
    expect(clone(sample, true).date).to.equal(sample.date);
    expect(clone(sample, new Set([Date])).date).to.equal(sample.date);
    expect(clone(sample, new Set([Map])).date).not.to.equal(sample.date);
    expect(clone(sample, (value) => value instanceof Date).date).to.equal(sample.date);
    expect(clone(sample, (_value, depth) => depth > 2).date).not.to.equal(sample.date);

    expect(clone(/abc/)).to.eql(/abc/);
    expect(clone(new BigInt64Array(4))).to.eql(new BigInt64Array(4));
    expect(clone(new BigUint64Array(4))).to.eql(new BigUint64Array(4));
    expect(clone(new Float64Array(4))).to.eql(new Float64Array(4));
    expect(clone(new Int8Array(4))).to.eql(new Int8Array(4));
    expect(clone(new Int16Array(4))).to.eql(new Int16Array(4));
    expect(clone(new Int32Array(4))).to.eql(new Int32Array(4));
    expect(clone(new Uint8Array(4))).to.eql(new Uint8Array(4));
    expect(clone(new Uint16Array(4))).to.eql(new Uint16Array(4));
    expect(clone(new Uint32Array(4))).to.eql(new Uint32Array(4));
  });

  it('should properly deep compares values', () => {
    expect(isEqual(0, -0)).to.be.true;
    expect(isEqual(5, 5)).to.be.true;
    expect(isEqual(null, null)).to.be.true;
    expect(isEqual(5, null)).to.be.false;
    expect(isEqual(null, 5)).to.be.false;
    expect(isEqual(undefined, undefined)).to.be.true;
    expect(isEqual(5, undefined)).to.be.false;
    expect(isEqual(undefined, 5)).to.be.false;
    expect(isEqual(null, undefined)).to.be.false;
    expect(isEqual(undefined, null)).to.be.false;
    expect(isEqual(NaN, NaN)).to.be.true;
    expect(isEqual(null, undefined)).to.be.false;
    expect(isEqual('it', 'it')).to.be.true;
    expect(isEqual(false, false)).to.be.true;
    expect(isEqual({ a: 5, b: { c: -7 } }, { a: 5, b: { c: -7 } })).to.be.true;
    expect(isEqual([1, 2, [3, 4]], [1, 2, [3, 4]])).to.be.true;
    expect(isEqual([], [0])).to.be.false;
    expect(isEqual([0], [1])).to.be.false;
    // noinspection JSConsecutiveCommasInArrayLiteral
    expect(isEqual([1, , 3], [1, undefined, 3])).to.be.false; // eslint-disable-line no-sparse-arrays
    const a = [1, 2, 3];
    expect(isEqual(a, [1, 2, 3])).to.be.true;
    (a as any).foo = -7;
    expect(isEqual(a, [1, 2, 3])).to.be.false;

    expect(isEqual(5, -7)).to.be.false;
    expect(isEqual('it', 'not it')).to.be.false;
    expect(isEqual(false, {})).to.be.false;
    expect(isEqual({ a: 5, b: { c: -7 } }, { a: 5, b: { c: -7, d: 'y' } })).to.be.false;
    expect(isEqual([1, 2, [3, 4]], [1, -2, [3, 4]])).to.be.false;

    const a1 = [1, undefined, 3]; // Undefined element vs. non-existent element
    const a2 = [1]; a2[2] = 3;

    expect(isEqual(a1, a2)).to.be.false;

    expect(isEqual(null, a2)).to.be.false;
    expect(isEqual(null, { foo: 'bar' })).to.be.false;
    expect(isEqual(a2, null)).to.be.false;
    expect(isEqual({ foo: 'bar' }, null)).to.be.false;
    expect(isEqual(new Float32Array([4.56, -3.14]), new Float32Array([4.56, -3.14]))).to.be.true;
    expect(isEqual(new Float32Array([4.56, -3.142]), new Float32Array([4.56, -3.14]))).to.be.false;

    expect(isEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: -2, c: 3 })).to.be.false;
    expect(isEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: -2, c: 3 },
      { keysToIgnore: ['b'] })).to.be.true;
    expect(isEqual({ a: 1, b: 2, c: 3 }, { a: 1, c: 3 },
      { keysToIgnore: ['b'] })).to.be.true;
    expect(isEqual({ a: 1, b: 2, c: 3 }, {},
      { keysToIgnore: ['b'] }, 'b')).to.be.true;
    expect(isEqual({ a: 1, c: 3 }, { a: 1, b: 2, c: 3 },
      { keysToIgnore: ['b'] })).to.be.true;
    expect(isEqual({ a: 1, b: 2, c: 3, d: '4' }, { a: 1, b: -2, c: 3, d: '4' },
      {
        compare: (a, b) => {
          if (isNumber(a) && isNumber(b))
            return Math.abs(a) === Math.abs(b);
          else
            return undefined;
        }
      })).to.be.true;

    expect(isEqual(new TestClass(9, 0), new TestClass3(9, 0))).to.be.true;
    expect(isEqual(new TestClass(9, 0), new TestClass3(9, 0), { mustBeSameClass: true })).to.be.false;
  });

  it('should properly flatten arrays', () => {
    expect(flatten([1, 2, 3])).to.eql([1, 2, 3]);
    expect(flatten([1, [2, 3], 4])).to.eql([1, 2, 3, 4]);
    expect(flatten([1, [2, [3, 4]], 5])).to.eql([1, 2, [3, 4], 5]);
    expect(flattenDeep([1, [2, [3, 4]], 5])).to.eql([1, 2, 3, 4, 5]);
  });

  it('should properly escape characters for literal use in regexes', () => {
    expect(regexEscape('foo[*]')).to.equal('foo\\[\\*\\]');
    expect(regexEscape('abc.def$g')).to.equal('abc\\.def\\$g');
  });

  it('should properly sort order of object keys', () => {
    const sample = { b: 1, c: -2, a: 5 };

    expect(JSON.stringify(sortObjectEntries(sample))).to.equal('{"a":5,"b":1,"c":-2}');
    expect(JSON.stringify(sortObjectEntries(sample, (a, b) => a[1] - b[1]))).to.equal('{"c":-2,"b":1,"a":5}');
    expect(sortObjectEntries(sample, true)).to.equal(sample);
  });

  it('should repeatedly call a function', () => {
    let s = '';

    repeat(5, n => s += n);
    expect(s).to.equal('43210');
  });

  it('should push items into an array, and return that modified array', () => {
    expect(push([5])).to.eql([5]);
    expect(push(null, 5)).to.eql([5]);
    expect(push([5], 6)).to.eql([5, 6]);
    expect(pushIf(false, [5], 6)).to.eql([5]);
    expect(pushIf(true, [5], 6)).to.eql([5, 6]);
    expect(pushIf(true, null, 6)).to.eql([6]);
    expect(push(['do'], 're', 'mi')).to.eql(['do', 're', 'mi']);
    expect(push(['do'], ...['re', 'mi'])).to.eql(['do', 're', 'mi']);
  });

  it('should convert digits between various localities', () => {
    let result: string;
    const base: string[] = [];

    expect(result = convertDigitsToAscii('foo ٠١٢٣٤ bar', base)).to.equals('foo 01234 bar');
    expect(base[1]).to.equal('Arabic');
    expect(result = convertDigits(result, base[0])).to.equals('foo ٠١٢٣٤ bar');
    expect(convertDigits(result, '٠')).to.equals('foo ٠١٢٣٤ bar');
    expect(result = convertDigitsToAscii('baz ৫৬৭৮৯ qux', base)).to.equals('baz 56789 qux');
    expect(base[1]).to.equal('Bengali');
    expect(convertDigits(result, base[0])).to.equals('baz ৫৬৭৮৯ qux');
    expect(convertDigitsToAscii('୦୨୧୩୪ send it to zoom', base)).to.equals('02134 send it to zoom');
    expect(base[1]).to.equal('Oriya');
    expect(isDigit('q')).to.be.false;
    expect(isDigit('7')).to.be.true;
    expect(isDigit('೫')).to.be.true;
    expect(isDigit('ꮗ')).to.be.false;
    expect(digitScript(null)).to.equal(undefined);
    expect(digitScript('꩒')).to.equal('Cham');
    expect(digitScript('4')).to.equal('ASCII');
    expect(digitScript('foo')).to.be.undefined;
  });

  it('encodeForUri', () => {
    expect(encodeForUri("foo ;,/?:@&=+$#!'()* bar")).to.equal('foo%20%3B%2C%2F%3F%3A%40%26%3D%2B%24%23%21%27%28%29%2A%20bar');
    expect(encodeForUri("foo ;,/?:@&=+$#!'()* bar", true)).to.equal('foo+%3B%2C%2F%3F%3A%40%26%3D%2B%24%23%21%27%28%29%2A+bar');
  });

  it('urlEncodeParams', () => {
    const sample = { foo: 'bar bar;', baz: 5.7, qux: false };

    expect(urlEncodeParams(sample)).to.equal('foo=bar%20bar%3B&baz=5.7&qux=false');
    expect(urlEncodeParams(sample, true)).to.equal('foo=bar+bar%3B&baz=5.7&qux=false');
  });

  it('isValidJson', () => {
    expect(isValidJson('{"do":456,"re":"xyz","mi":null}')).to.be.true;
    expect(isValidJson('{do":456,"re":"xyz","mi":null}')).to.be.false;
  });

  it('toMaxFixed', () => {
    // Skip these tests if the default locale doesn't match expectations.
    if (!isGoodLocale())
      return;

    expect(toMaxFixed(Math.PI, 2)).to.equal('3.14');
    expect(toMaxFixed(Math.PI, 3)).to.equal('3.142');
    expect(toMaxFixed(Math.PI, 3, 'fr')).to.equal('3,142');
    expect(toMaxFixed(1.23, 3)).to.equal('1.23');
    expect(toMaxFixed(1.234, 3)).to.equal('1.234');
    expect(toMaxFixed(1.2345, 3)).to.equal('1.235');
    expect(toMaxFixed(78901.23456789, 6, undefined, true)).to.equal('78,901.234568');
    expect(toMaxFixed(78901.23456789, 6, 'es', true)).to.equal('78.901,234568');
    expect(toMaxFixed(-1.1, 5)).to.equal('-1.1');
  });

  it('toMaxSignificant', () => {
    // Skip these tests if the default locale doesn't match expectations.
    if (!isGoodLocale())
      return;

    expect(toMaxSignificant(Math.PI, 2)).to.equal('3.1');
    expect(toMaxSignificant(Math.PI, 3)).to.equal('3.14');
    expect(toMaxSignificant(Math.PI, 3, 'fr')).to.equal('3,14');
    expect(toMaxSignificant(1.23, 4)).to.equal('1.23');
    expect(toMaxSignificant(-1234567, 3)).to.equal('-1230000');
    expect(toMaxSignificant(-1234567, 3, null, true)).to.equal('-1,230,000');
    expect(toMaxSignificant(-1234567, 3, 'es-ES', true)).to.equal('-1.230.000');
    expect(toMaxSignificant(-1234567, 4)).to.equal('-1235000');
  });

  it('regex tag function', () => {
    expect((regex`\d+
    // Second part
    -\d+${'i'}`).toString()).to.equal(String.raw`/\d+-\d+/i`);
    expect((regex`^\s*(\d{5,6}) // Modified Julian Date
       \s+(\d\d-\d\d-\d\d) // date, YY-MM-DD
       \s+(\d\d:\d\d:\d\d) // time, HH:mm:ss
       \s+(\d\d) // ST/DST code
       \s+(\d) // leap second
       \s+(\d) // DUT1
       \s+([\d.]+) // msADV
       \s+UTC\(NIST\) // label
       \s+\*(\s*)$ // On-Time Marker (OTM)
       `).toString()).to.equal(String.raw`/^\s*(\d{5,6})\s+(\d\d-\d\d-\d\d)\s+(\d\d:\d\d:\d\d)\s+(\d\d)\s+(\d)\s+(\d)\s+([\d.]+)\s+UTC\(NIST\)\s+\*(\s*)$/`);
  });

  it('toNumber, toValidNumber, toInt, toValidInt', () => {
    expect(toNumber('3.4')).to.equal(3.4);
    expect(toNumber(3.4)).to.equal(3.4);
    expect(toNumber('!3.4')).to.equal(0);
    expect(toNumber('!3.4', 7)).to.equal(7);
    expect(toNumber('!3.4', null)).to.equal(null);
    expect(toNumber(NaN)).to.be.NaN;
    expect(toNumber(1 / 0)).to.not.be.finite;
    expect(toValidNumber('3.4')).to.equal(3.4);
    expect(toValidNumber(3.4)).to.equal(3.4);
    expect(toValidNumber('!3.4')).to.equal(0);
    expect(toValidNumber('!3.4', 7)).to.equal(7);
    expect(toValidNumber(NaN)).to.equal(0);
    expect(toValidNumber(1 / 0)).to.equal(0);
    expect(toInt('123')).to.equal(123);
    expect(toInt('g', 0, 30)).to.equal(16);
    expect(toInt(123.4)).to.equal(123);
    expect(toInt('!123')).to.equal(0);
    expect(toInt('!123', 7)).to.equal(7);
    expect(toInt('!123', null)).to.equal(null);
    expect(toInt(NaN)).to.equal(0);
    expect(toInt(1 / 0)).to.be.finite;
    expect(toValidInt('123')).to.equal(123);
    expect(toValidInt('g', 0, 30)).to.equal(16);
    expect(toValidInt(123.4)).to.equal(123);
    expect(toValidInt('!123')).to.equal(0);
    expect(toValidInt('!123', 7)).to.equal(7);
    expect(toValidInt(NaN)).to.equal(0);
    expect(toValidInt(1 / 0)).to.equal(0);
    expect(toNumber(-878n, 9999)).to.equal(-878);
    expect(toNumber(BigInt('8'.repeat(350)), 9999)).to.equal(9999);
  });

  it('compareDottedValues', () => {
    expect(compareDottedValues('1.0', '2.0')).below(0);
    expect(compareDottedValues('2.0', '1.0')).above(0);
    expect(compareDottedValues('33.22.11', '33.22.11')).to.equal(0);
    expect(compareDottedValues('1.0', '1.0.1')).below(0);
    expect(compareDottedValues('1.0.10', '1.0.9')).above(0);
    expect(compareDottedValues('', '')).to.equal(0);
    expect(compareDottedValues('2.1', '2')).above(0);
    expect(compareDottedValues('2', '2.1')).below(0);
  });

  it('should properly compute 53-bit checksums', () => {
    expect(checksum53('Away we go!')).to.equal('19757548BB35B8');
    expect(checksum53('Spiny Norman')).to.equal('062A4A04389CDA');
  });

  it('getOrSet, getOrSetAsync', async () => {
    const map = new Map<string, number>();

    map.set('a', 1);
    expect(getOrSet(map, 'a', () => 2)).to.equal(1);
    expect(getOrSet(map, 'b', () => 3)).to.equal(3);
    expect(getOrSet(map, 'c', 5)).to.equal(5);
    await expect(getOrSetAsync(map, 'd', () => Promise.resolve(77))).to.eventually.equal(77);
    expect(JSON.stringify(Array.from(map.entries()))).to.equal('[["a",1],["b",3],["c",5],["d",77]]');
  });

  it('should numerically sort arrays', () => {
    expect([10, 2, 5, 20].sort(numSort)).to.deep.equal([2, 5, 10, 20]);
    expect([10, 2, '5', 20].sort(numSort)).to.deep.equal([2, '5', 10, 20]);
    expect([10, 2, 5, 20].sort(reverseNumSort)).to.deep.equal([20, 10, 5, 2]);
  });

  it('nfe, ufe', () => {
    expect(nfe([1])).to.deep.equal([1]);
    expect(nfe([])).to.equal(null);
    expect(ufe([2, 3])).to.deep.equal([2, 3]);
    expect(ufe([])).to.equal(undefined);
  });

  it('forEach, forEach2', () => {
    let s = '';
    const obj = { a: 2, b: 3 } as any;

    forEach(obj, (key, value) => s += `${key},${value};`);
    expect(s).to.equal('a,2;b,3;');

    s = '';
    forEach(null, (key, value) => s += `${key},${value};`);
    expect(s).to.equal('');

    s = '';
    obj[Symbol('foo')] = '4';
    forEach2(obj, (key, value) => s += `${isSymbol(key) ? 'sym' : key},${value};`);
    expect(s).to.equal('a,2;b,3;sym,4;');

    s = '';
    forEach2(null, (key, value) => s += `${isSymbol(key) ? 'sym' : key},${value}`);
    expect(s).to.equal('');
  });

  it('keyCount', () => {
    expect(keyCount(null)).to.equal(0);
    expect(keyCount({})).to.equal(0);
    expect(keyCount({ a: 0, b: 1 })).to.equal(2);
    expect(keyCount([0, 1, 2])).to.equal(4); // length is the fourth key
  });

  it('should sleep for a given number of milliseconds', async () => {
    // Browser seems to need more timing lenience.
    const delta = (typeof document === 'undefined' ? 0 : 25);

    const start = processMillis();
    await sleep(200);
    expect(processMillis() - start).to.be.above(190 - delta);
    expect(processMillis() - start).to.be.below(210 + delta);
  });

  it('debounce', async () => {
    const start = processMillis();
    let count = 0;
    let time = 0;

    function testFunction(a: number, b: string): number {
      ++count;
      time = processMillis();
      expect(a === 7 && b === 'baz').to.be.true;

      return 909;
    }

    const debounced = debounce(10, testFunction, val => expect(val).to.equal(909));

    debounced(5, 'baz');
    debounced(6, 'baz');
    debounced(7, 'baz');
    await sleep(100);

    expect(time).is.greaterThan(start + 5);
    expect(count).equals(1);
  });

  it('throttle', async () => {
    let start = processMillis();
    let count = 0;
    let time = 0;
    let rightA = -7;

    function testFunction(a: number, b: string, c: string): number {
      ++count;
      time = processMillis();
      expect(a === rightA && b === 'foo' && c === 'bar').to.be.true;

      return 909;
    }

    const throttled = throttle(10, testFunction, val => expect(val).to.equal(909));

    throttled(-7, 'foo', 'bar');
    throttled(-8, 'foo', 'bar');
    throttled(-9, 'foo', 'bar');
    await sleep(100);

    expect(time).is.lessThan(start + 5);
    expect(count).equals(1);

    const throttledTrailing = throttle(-10, testFunction, val => { expect(val).to.equal(909); rightA = -9; });

    start = processMillis();
    count = 0;
    throttledTrailing(-7, 'foo', 'bar');
    throttledTrailing(-8, 'foo', 'bar');
    throttledTrailing(-9, 'foo', 'bar');
    await sleep(100);

    expect(time).is.greaterThan(start + 5);
    expect(count).equals(2);
  });
});
