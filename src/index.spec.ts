import { blendColors, parseColor } from './browser-graphics-util';
import { doesCharacterGlyphExist, getFont, htmlEscape, htmlUnescape, urlEncodeParams } from './browser-util';
import {
  classOf, clone, DateTimeOptions, first, flatten, flattenDeep, formatDateTime, isArray, isArrayLike, isBoolean, isEqual, isFunction,
  isNonFunctionObject, isNumber, isObject, isString, isSymbol, last, nth, processMillis, repeat, sortObjectEntries, toBoolean, toInt
} from './misc-util';
import { asLines, extendDelimited, isAllUppercase, isAllUppercaseWords, makePlainASCII, regexEscape, stripLatinDiacriticals, toMixedCase, toTitleCase } from './string-util';

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

  it('should blend colors correctly', () => {
    let color = blendColors('white', 'black');
    expect(color).toEqual('#808080');

    color = blendColors('white', 'black', 0.75);
    expect(color).toEqual('#BFBFBF');

    color = blendColors('rgba(20, 40, 60, 0.6)', 'rgba(40, 60, 80, 0.4)');
    expect(color).toEqual('rgba(30, 50, 70, 0.5)');
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
    let start = processMillis();
    const intervals: number[] = [];
    const interval = setInterval(() => {
      intervals.push(processMillis() - start);

      if (intervals.length >= 5) {
        clearInterval(interval);
        // Allow for some outlier values caused by slowness of start-up
        expect(intervals.filter(t => t >= 40 && t <= 60).length).toBeGreaterThanOrEqual(3);
        done();
      }

      start = processMillis();
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

  it('should correctly convert to boolean', () => {
    expect(toBoolean('t', false)).toBe(true);
    expect(toBoolean('YES', false)).toBe(true);
    expect(toBoolean('False', true)).toBe(false);
    expect(toBoolean('n', true)).toBe(false);
    expect(toBoolean('?', true)).toBe(true);
    expect(toBoolean('?', false)).toBe(false);
    expect(toBoolean('?')).toBe(false);
    expect(toBoolean(null, true)).toBe(true);
    expect(toBoolean(undefined, true)).toBe(true);
    expect(toBoolean('')).toBe(false);
    expect(toBoolean('', true)).toBe(true);
    expect(toBoolean('', false, true)).toBe(true);
  });

  it('should correctly convert to int', () => {
    expect(toInt('-47')).toBe(-47);
    expect(toInt('foo', 99)).toBe(99);
    expect(toInt('1011', -1, 2)).toBe(11);
    expect(toInt('cafebabe', -1, 16)).toBe(3405691582);
    expect(toInt('cafegabe', -1, 16)).toBe(-1);
  });

  it('should get first, last, nth element of an array', () => {
    const a = [1.1, 2, 4, -3];
    const elem = document.createElement('div');
    elem.appendChild(document.createElement('p'));
    elem.appendChild(document.createElement('span'));
    elem.appendChild(document.createElement('script'));

    expect(first(a)).toBe(1.1);
    expect(last(a)).toBe(-3);
    expect(nth(a, 2)).toBe(4);
    expect(last(['alpha', 'omega'])).toBe('omega');
    expect(last([])).toBe(undefined);
    expect(last(null)).toBe(undefined);
    expect(first(elem.children).outerHTML).toBe('<p></p>');
    expect(last(elem.children).outerHTML).toBe('<script></script>');
    expect(nth(elem.children, 1).outerHTML).toBe('<span></span>');
  });

  it('should split string into lines', () => {
    expect(asLines('')).toEqual([]);
    expect(asLines('no breaks')).toEqual(['no breaks']);
    expect(asLines('foo\nbar\r\nbaz\rqux')).toEqual(['foo', 'bar', 'baz', 'qux']);
    expect(asLines('The end\n')).toEqual(['The end', '']);
    expect(asLines('The\n\nend\n\n\n', true)).toEqual(['The', '', 'end']);
  });

  it('should escape and unescape for HTML', () => {
    expect(htmlEscape(`2 < 3 & 5 > 4, "Don't you see?"`)).toEqual(`2 &lt; 3 &amp; 5 &gt; 4, "Don't you see?"`);
    expect(htmlEscape(`2 < 3 & 5 > 4, "Don't you see?"`, true))
      .toEqual('2 &lt; 3 &amp; 5 &gt; 4, &quot;Don&apos;t you see?&quot;');
    expect(htmlUnescape('2 &lt; 3 &amp; 5 &gt; 4, &quot;Don&apos;t you see?&quot; &#33 &#xB6; &unknown; &#nope; @'))
      .toEqual(`2 < 3 & 5 > 4, "Don't you see?" ! ¶ &unknown; &#nope; @`);
  });

  it('should properly encode URL parameters', () => {
    expect(urlEncodeParams({ foo: 22, bar: false, baz: 'M&M', nil: null })).toEqual('foo=22&bar=false&baz=M%26M');
  });

  it('should properly convert strings to mixed case', () => {
    expect(toMixedCase("isn't this working?")).toEqual("Isn't This Working?");
    expect(toMixedCase('ISN’T THIS WORKING?')).toEqual('Isn’t This Working?');
    expect(toMixedCase('one two-three 4x j99')).toEqual('One Two-Three 4x j99');
  });

  it('should properly convert strings to title case', () => {
    expect(toTitleCase("isn't this working?")).toEqual("Isn't This Working?");
    expect(toTitleCase('ISN’T THIS WORKING?')).toEqual('Isn’t This Working?');
    expect(toTitleCase('read ’em and weep', { shortSmall: ["'em"] })).toEqual('Read ’em and Weep');
    expect(toTitleCase('from the ëarth to the moon')).toEqual('From the Ëarth to the Moon');
    expect(toTitleCase('YOUR NEW IPHONE')).toEqual('Your New iPhone');
    expect(toTitleCase('born in the usa', { special: ['USA'] })).toEqual('Born in the USA');
    expect(toTitleCase('born in the USA', { keepAllCaps: true })).toEqual('Born in the USA');
    expect(toTitleCase("born in the ol' USA", { keepAllCaps: true, shortSmall: ['-in', "ol'"] })).toEqual("Born In the ol' USA");
  });

  it('should properly detect uppercase strings and words', () => {
    expect(isAllUppercase('FooBar')).toBeFalse();
    expect(isAllUppercase('FOOBAR')).toBeTrue();
    expect(isAllUppercase('FOO BAR BAZ, 123')).toBeFalse();
    expect(isAllUppercaseWords('FooBar')).toBeFalse();
    expect(isAllUppercaseWords('FOOBAR')).toBeTrue();
    expect(isAllUppercaseWords('FOO BAR BAZ, 123')).toBeTrue();
    expect(isAllUppercaseWords('FOO BaR BAZ, 123')).toBeFalse();
  });

  it('should properly recognize data types', () => {
    expect(isArray(5)).toBeFalse();
    expect(isArray('foo')).toBeFalse();
    const elem = document.createElement('div');
    elem.appendChild(document.createElement('p'));
    expect(isArray(elem.childNodes)).toBeFalse();

    expect(isArrayLike(-7)).toBeFalse();
    expect(isArrayLike([-7])).toBeTrue();
    expect(isArrayLike(elem.childNodes)).toBeTrue();

    expect(isBoolean(-7)).toBeFalse();
    expect(isBoolean(false)).toBeTrue();
    expect(isBoolean(elem.childNodes)).toBeFalse();

    expect(isFunction(-7)).toBeFalse();
    expect(isFunction(() => 'bar')).toBeTrue();
    expect(isFunction(Math.sin)).toBeTrue();

    expect(isNonFunctionObject(Math.PI)).toBeFalse();
    expect(isNonFunctionObject({})).toBeTrue();
    expect(isNonFunctionObject(() => 'bar')).toBeFalse();
    expect(isNonFunctionObject('baz')).toBeFalse();

    expect(isNumber(Math.PI)).toBeTrue();
    expect(isNumber(() => 'bar')).toBeFalse();
    expect(isNumber(NaN)).toBeTrue();

    expect(isObject(Math.PI)).toBeFalse();
    expect(isObject({})).toBeTrue();
    expect(isObject(() => 'bar')).toBeTrue();
    expect(isObject('baz')).toBeFalse();

    expect(isString(Math.PI)).toBeFalse();
    expect(isString('bar')).toBeTrue();
    expect(isString(NaN)).toBeFalse();

    expect(isSymbol(Math.PI)).toBeFalse();
    expect(isSymbol(Symbol('bar'))).toBeTrue();
  });

  it('should properly get class names', () => {
    expect(classOf(3)).toEqual(null);
    expect(classOf(3, true)).toEqual('no-class:number');
    expect(classOf(new Date())).toEqual('Date');
    expect(classOf(new TestClass(44, 55))).toEqual('TestClass');
  });

  it('should properly deep clone values', () => {
    expect(clone(5)).toEqual(5);
    expect(clone('it')).toEqual('it');
    expect(clone(false)).toEqual(false);
    expect(clone({ a: 5, b: { c: -7 } })).toEqual({ a: 5, b: { c: -7 } });
    expect(clone([1, 2, [3, 4]])).toEqual([1, 2, [3, 4]]);

    const orig = new TestClass(2, 3);
    const instanceClone = clone(orig);

    expect(instanceClone.sum()).toEqual(5);
    expect(classOf(instanceClone)).toEqual('TestClass');
    orig.array[0] = -7;
    expect(instanceClone.array[0]).toEqual(2);

    const orig2 = new TestClass2('foo', 2, 3);
    const instanceClone2 = clone(orig2);

    expect(instanceClone2.name).toEqual('foo');
    expect(instanceClone2.sum()).toEqual(5);
    expect(classOf(instanceClone2)).toEqual('TestClass2');
    orig2[0] = -7;
    expect(instanceClone2.sum()).toEqual(5);

    expect(clone(new Date('2021-04-01T12:34Z')).toISOString()).toEqual('2021-04-01T12:34:00.000Z');
    expect(clone(new Set([2, 78])).has(78)).toBeTrue();
    expect(clone(new Map([[2, 78]])).get(2)).toEqual(78);
    expect(clone(new Float32Array([1.25]))[0]).toEqual(1.25);
    expect(clone(new Uint8ClampedArray([3, 400]))[1]).toEqual(255);

    const recurse = new Set<any>([1, 2]);

    recurse.add([recurse]);
    expect(clone(recurse)).toEqual(recurse);
    expect(isEqual(recurse, recurse)).toBeTrue();

    const sample = { date: new Date(), foo: 5 };

    expect(clone(sample).date).not.toBe(sample.date);
    expect(clone(sample, true).date).toBe(sample.date);
    expect(clone(sample, new Set([Date])).date).toBe(sample.date);
    expect(clone(sample, new Set([Map])).date).not.toBe(sample.date);
    expect(clone(sample, (value) => value instanceof Date).date).toBe(sample.date);
    expect(clone(sample, (value, depth) => depth > 2).date).not.toBe(sample.date);
  });

  it('should properly deep compares values', () => {
    expect(isEqual(0, -0)).toBeTrue();
    expect(isEqual(5, 5)).toBeTrue();
    expect(isEqual(null, null)).toBeTrue();
    expect(isEqual(5, null)).toBeFalse();
    expect(isEqual(null, 5)).toBeFalse();
    expect(isEqual(undefined, undefined)).toBeTrue();
    expect(isEqual(5, undefined)).toBeFalse();
    expect(isEqual(undefined, 5)).toBeFalse();
    expect(isEqual(null, undefined)).toBeFalse();
    expect(isEqual(undefined, null)).toBeFalse();
    expect(isEqual(NaN, NaN)).toBeTrue();
    expect(isEqual(null, undefined)).toBeFalse();
    expect(isEqual('it', 'it')).toBeTrue();
    expect(isEqual(false, false)).toBeTrue();
    expect(isEqual({ a: 5, b: { c: -7 } }, { a: 5, b: { c: -7 } })).toBeTrue();
    expect(isEqual([1, 2, [3, 4]], [1, 2, [3, 4]])).toBeTrue();
    expect(isEqual([], [0])).toBeFalse();
    expect(isEqual([0], [1])).toBeFalse();

    expect(isEqual(5, -7)).toBeFalse();
    expect(isEqual('it', 'not it')).toBeFalse();
    expect(isEqual(false, {})).toBeFalse();
    expect(isEqual({ a: 5, b: { c: -7 } }, { a: 5, b: { c: -7, d: 'y' } })).toBeFalse();
    expect(isEqual([1, 2, [3, 4]], [1, -2, [3, 4]])).toBeFalse();

    const a1 = [1, undefined, 3]; // Undefined element vs. non-existent element
    const a2 = [1]; a2[2] = 3;

    expect(isEqual(a1, a2)).toBeFalse();

    expect(isEqual(null, a2)).toBeFalse();
    expect(isEqual(null, { foo: 'bar' })).toBeFalse();
    expect(isEqual(a2, null)).toBeFalse();
    expect(isEqual({ foo: 'bar' }, null)).toBeFalse();
    expect(isEqual(new Float32Array([4.56, -3.14]), new Float32Array([4.56, -3.14]))).toBeTrue();
    expect(isEqual(new Float32Array([4.56, -3.142]), new Float32Array([4.56, -3.14]))).toBeFalse();
  });

  it('should properly flatten arrays', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
    expect(flatten([1, [2, [3, 4]], 5])).toEqual([1, 2, [3, 4], 5]);
    expect(flattenDeep([1, [2, [3, 4]], 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('should properly escape characters for literal use in regexes', () => {
    expect(regexEscape('foo[*]')).toEqual('foo\\[\\*\\]');
    expect(regexEscape('abc.def$g')).toEqual('abc\\.def\\$g');
  });

  it('should properly sort order of object keys', () => {
    const sample = { b: 1, c: -2, a: 5 };

    expect(JSON.stringify(sortObjectEntries(sample))).toEqual('{"a":5,"b":1,"c":-2}');
    expect(JSON.stringify(sortObjectEntries(sample, (a, b) => a[1] - b[1]))).toEqual('{"c":-2,"b":1,"a":5}');
    expect(sortObjectEntries(sample, true)).toBe(sample);
  });

  it('should repeatedly call a function', () => {
    let s = '';

    repeat(5, n => s += n);
    expect(s).toEqual('01234');
  });
});
