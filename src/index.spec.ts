import { expect } from 'chai';
import { blendColors, parseColor } from './browser-graphics-util';
import { doesCharacterGlyphExist, getCssValue, getCssValues, getFont, getFontMetrics, htmlEscape, htmlUnescape, urlEncodeParams } from './browser-util';
import {
  classOf, clone, DateTimeOptions, first, flatten, flattenDeep, formatDateTime, isArray, isArrayLike, isBoolean, isEqual, isFunction,
  isNonFunctionObject, isNumber, isObject, isString, isSymbol, last, nth, processMillis, push, pushIf, repeat, sortObjectEntries,
  toBoolean, toInt
} from './misc-util';
import {
  asLines, convertDigits, convertDigitsToAscii, digitScript, extendDelimited, isAllUppercase, isAllUppercaseWords, isDigit, makePlainASCII, regexEscape,
  stripLatinDiacriticals, toMixedCase, toTitleCase
} from './string-util';

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

describe('@tubular/util', () => {
  it('should extend a string, adding delimiters where needed', () => {
    let s = '';

    s = extendDelimited(s, 'A');
    expect(s).to.equal('A');
    s = extendDelimited(s, 'B');
    expect(s).to.equal('A, B');
  });

  it('should parse colors correctly', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

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

  it('should blend colors correctly', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

    let color = blendColors('white', 'black');
    expect(color).to.equal('#808080');

    color = blendColors('white', 'black', 0.75);
    expect(color).to.equal('#BFBFBF');

    color = blendColors('rgba(20, 40, 60, 0.6)', 'rgba(40, 60, 80, 0.4)');
    expect(color).to.equal('rgba(30, 50, 70, 0.5)');
  });

  it('should format date/time correctly', () => {
    expect(formatDateTime()).to.match(/\d{4}-\d\d-\d\d \d\d:\d\d:\d\d [-+]\d{4}/);
    expect(formatDateTime('Fri Jun 07 2019 21:18:36 GMT-0400',
      [DateTimeOptions.USE_T, DateTimeOptions.USE_Z])).to.equal('2019-06-08T01:18:36Z');
    expect(new Date('2019-06-08 01:18:36.890Z').getTime()).to.equal(1559956716890);
    expect(formatDateTime(1559956716890,
      [DateTimeOptions.WITH_MILLIS, DateTimeOptions.USE_Z])).to.equal('2019-06-08 01:18:36.890Z');
    expect(formatDateTime([DateTimeOptions.TIME_ONLY])).to.match(/\d\d:\d\d:\d\d [-+]\d{4}/);
  });

  /* cSpell:disable */
  it('should strip diacritical marks from latin characters', () => {
    // noinspection SpellCheckingInspection
    expect(stripLatinDiacriticals('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'))
      .to.equal('AAAAAAÆCEEEEIIIIÐNOOOOO×OUUUUYÞßaaaaaaæceeeeiiiiðnooooo÷ouuuuyþy');
  });

  it('should simplify symbols and latin characters to plain ASCII', () => {
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'))
      .to.equal('AAAAAAAeCEEEEIIIIDhNOOOOO_OUUUUYThssaaaaaaaeceeeeiiiidhnooooo_ouuuuythy');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('Þjóð')).to.equal('Thjodh');
    // noinspection SpellCheckingInspection
    expect(makePlainASCII('ÞJÓÐ')).to.equal('THJODH');
    expect(makePlainASCII('[café*]')).to.equal('[cafe*]');
    expect(makePlainASCII('[café*]', true)).to.equal('(cafe-)');
  });
  /* cSpell:enable */

  it('should get fonts in correct shorthand form', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

    const span = document.createElement('span');

    span.textContent = '?';
    span.style.font = 'bold italic 14pt "Courier New", monospace';
    span.style.lineHeight = '1.5em';
    span.style.fontStretch = '125%';
    document.body.appendChild(span);

    const font = getFont(span);

    expect(font).to.contain('italic');
    expect(font).to.contain('"Courier New"');
    expect(font).to.contain('monospace');
    expect(font).to.contain('expanded');
    expect(font).to.match(/\b18\.6\d+px\s*\/\s*28px\b/);
    expect(font).to.match(/\b(bold|700)\b/);
    document.body.removeChild(span);
  });

  it('should get single and multiple css style values', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

    const span = document.createElement('span');

    span.style.color = 'red';
    span.style.lineHeight = '24px';
    document.body.appendChild(span);

    expect(getCssValue(span, 'color')).to.equal('rgb(255, 0, 0)');
    expect(getCssValue(span, 'line-height')).to.equal('24px');
    expect(getCssValues(span, ['color', 'line-height'])).to.eql(['rgb(255, 0, 0)', '24px']);
    document.body.removeChild(span);
  });

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

  it('should correctly identify missing character glyphs', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

    const fonts = ['12px sans-serif', '14pt monospace'];

    for (const font of fonts) {
      expect(doesCharacterGlyphExist(font, 'a')).to.be.true;
      expect(doesCharacterGlyphExist(font, '\uFFFE')).to.be.false;
      expect(doesCharacterGlyphExist(font, 0x2022)).to.be.true;
      expect(doesCharacterGlyphExist(font, 0xFFFF)).to.be.false;
    }
  });

  it('should correctly convert to boolean', () => {
    expect(toBoolean('t', false)).to.equal(true);
    expect(toBoolean('YES', false)).to.equal(true);
    expect(toBoolean('False', true)).to.equal(false);
    expect(toBoolean('n', true)).to.equal(false);
    expect(toBoolean('?', true)).to.equal(true);
    expect(toBoolean('?', false)).to.equal(false);
    expect(toBoolean('?')).to.equal(false);
    expect(toBoolean(null, true)).to.equal(true);
    expect(toBoolean(undefined, true)).to.equal(true);
    expect(toBoolean('')).to.equal(false);
    expect(toBoolean('', true)).to.equal(true);
    expect(toBoolean('', false, true)).to.equal(true);
  });

  it('should correctly convert to int', () => {
    expect(toInt('-47')).to.equal(-47);
    expect(toInt('foo', 99)).to.equal(99);
    expect(toInt('1011', -1, 2)).to.equal(11);
    expect(toInt('cafebabe', -1, 16)).to.equal(3405691582);
    /* cSpell:disable-next-line */ // noinspection SpellCheckingInspection
    expect(toInt('cafegabe', -1, 16)).to.equal(-1);
  });

  it('should get first, last, nth element of an array', () => {
    const a = [1.1, 2, 4, -3];

    expect(first(a)).to.equal(1.1);
    expect(last(a)).to.equal(-3);
    expect(nth(a, 2)).to.equal(4);
    expect(last(['alpha', 'omega'])).to.equal('omega');
    expect(last([])).to.equal(undefined);
    expect(last(null)).to.equal(undefined);
  });

  it('should get first, last, nth element of a DOM array', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

    const elem = document.createElement('div');
    elem.appendChild(document.createElement('p'));
    elem.appendChild(document.createElement('span'));
    elem.appendChild(document.createElement('script'));

    expect(last(null)).to.equal(undefined);
    expect(first(elem.children).outerHTML).to.equal('<p></p>');
    expect(last(elem.children).outerHTML).to.equal('<script></script>');
    expect(nth(elem.children, 1).outerHTML).to.equal('<span></span>');
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
    expect(toMixedCase('one two-three 4x j99')).to.equal('One Two-Three 4x j99');
  });

  it('should properly convert strings to title case', () => {
    expect(toTitleCase("isn't this working?")).to.equal("Isn't This Working?");
    expect(toTitleCase('ISN’T THIS WORKING?')).to.equal('Isn’t This Working?');
    expect(toTitleCase('read ’em and weep', { shortSmall: ["'em"] })).to.equal('Read ’em and Weep');
    expect(toTitleCase('from the ëarth to the moon')).to.equal('From the Ëarth to the Moon');
    expect(toTitleCase('YOUR NEW IPHONE')).to.equal('Your New iPhone');
    expect(toTitleCase('born in the usa', { special: ['USA'] })).to.equal('Born in the USA');
    expect(toTitleCase('born in the USA', { keepAllCaps: true })).to.equal('Born in the USA');
    expect(toTitleCase("born in the ol' USA", { keepAllCaps: true, shortSmall: ['-in', "ol'"] })).to.equal("Born In the ol' USA");
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

  it('should properly recognize DOM data types', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

    expect(isArray(5)).to.be.false;
    expect(isArray('foo')).to.be.false;

    const elem = document.createElement('div');

    elem.appendChild(document.createElement('p'));
    expect(isArray(elem.childNodes)).to.be.false;
    expect(isArrayLike(elem.childNodes)).to.be.true;
    expect(isBoolean(elem.childNodes)).to.be.false;
  });

  it('should properly get class names', () => {
    expect(classOf(3)).to.equal(null);
    expect(classOf(3, true)).to.equal('no-class:number');
    expect(classOf(new Date())).to.equal('Date');
    expect(classOf(new TestClass(44, 55))).to.equal('TestClass');
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
    expect(clone(sample, (value, depth) => depth > 2).date).not.to.equal(sample.date);
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
    expect(push([5], 6)).to.eql([5, 6]);
    expect(pushIf(false, [5], 6)).to.eql([5]);
    expect(pushIf(true, [5], 6)).to.eql([5, 6]);
    expect(push(['do'], 're', 'mi')).to.eql(['do', 're', 'mi']);
    expect(push(['do'], ...['re', 'mi'])).to.eql(['do', 're', 'mi']);
  });

  it('should convert digits between various localities', () => {
    let result: string;
    const base: string[] = [];

    expect(result = convertDigitsToAscii('foo ٠١٢٣٤ bar', base)).to.equals('foo 01234 bar');
    expect(base[1]).to.equal('Arabic');
    expect(convertDigits(result, base[0])).to.equals('foo ٠١٢٣٤ bar');
    expect(result = convertDigitsToAscii('baz ৫৬৭৮৯ qux', base)).to.equals('baz 56789 qux');
    expect(base[1]).to.equal('Bengali');
    expect(convertDigits(result, base[0])).to.equals('baz ৫৬৭৮৯ qux');
    expect(convertDigitsToAscii('୦୨୧୩୪ send it to zoom', base)).to.equals('02134 send it to zoom');
    expect(base[1]).to.equal('Oriya');
    expect(isDigit('q')).to.be.false;
    expect(isDigit('7')).to.be.true;
    expect(isDigit('೫')).to.be.true;
    expect(isDigit('ꮗ')).to.be.false;
    expect(digitScript('꩒')).to.equal('Cham');
    expect(digitScript('4')).to.equal('ASCII');
    expect(digitScript('foo')).to.be.undefined;
  });

  it('should determine font metrics correctly', () => {
    if (typeof document === 'undefined') {
      console.info('Test must be run in browser');
      return;
    }

    expect(getFontMetrics('24px Arial').lineHeight).to.be.approximately(28, 1);
    expect(getFontMetrics('24px Arial', '\u1B52').extraLineHeight).to.be.approximately(35, 1);
  });
});
