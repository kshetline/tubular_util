let notLetterPattern: RegExp;
let allUpperPattern: RegExp;
let wordPattern: RegExp;
let digitPattern: RegExp;

try {
  // I want these regexes to fail if not supported, so it takes a bit of obfuscation
  // to prevent Babel from transforming them into something that doesn't fail.
  const u = String.fromCharCode(117);
  'm&m'.split(new RegExp('(?<!4)[^\\' + 'p{L}]+', u));
  // This line reached if Unicode character classes and lookbehind both work.
  notLetterPattern = new RegExp('\\' + 'P{L}', 'g' + u);
  digitPattern = new RegExp('^\\' + 'p{Nd}$', u);
  allUpperPattern = new RegExp('^\\' + 'p{Lu}+$', u);
  wordPattern = new RegExp(String.raw`(?<=^|[^\p{L}])['’ʼ]?[` + '\\' + String.raw`p{L}'’ʼ\u0300-\u036F]+['’ʼ]?(?=[^\p{L}]|$)`, 'g' + u);
}
catch /* istanbul ignore next */ {
  notLetterPattern = /[A-ZÀ-ÖØ-ÿ]/ig;
  digitPattern = /^\d$/;
  allUpperPattern = /^[A-ZÀ-ÖØ-Þ]+$/;
  wordPattern = /['’ʼ]?\b[A-Za-zÀ-ÖØ-ÿ'’ʼ\u0300-\u036F]+\b['’ʼ]?/g;
}

export function asLines(s: string, trimFinalBlankLines = false, trimEachLine = false): string[] {
  if (s) {
    let lines = s.split(/\r\n|\r|\n/);

    if (trimFinalBlankLines)
      while (lines[lines.length - 1] === '')
        lines.pop();

    if (trimEachLine)
      lines = lines.map(line => line.trim());

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

/* cspell:disable */ // noinspection SpellCheckingInspection
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
// noinspection SpellCheckingInspection
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
/* cspell:enable */

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

    if (32 <= cc && cc <= 126) {} // Do nothing
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

export function makePlainASCII_lc(s: string, forFileName = false): string {
  if (s)
    return makePlainASCII(s, forFileName).toLowerCase();
  else
    return s;
}

export function makePlainASCII_UC(s: string, forFileName = false): string {
  if (s)
    return makePlainASCII(s, forFileName).toUpperCase();
  else
    return s;
}

function capitalizeFirstLetter(s: string): string {
  if (s.length > 1 && /^['’ʼ]/.test(s))
    return s.charAt(0) + s.charAt(1).toUpperCase() + s.substring(2).toLowerCase();
  else
    return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
}

function toCanonicalLowercase(s: string): string {
  return s.toLowerCase().replace(/['’ʼ]/g, "'");
}

export function isAllUppercase(s: string): boolean {
  return !!s && allUpperPattern.test(s);
}

export function isAllUppercaseWords(s: string): boolean {
  return !!s && allUpperPattern.test(s.replace(notLetterPattern, ''));
}

export function toMixedCase(s: string): string {
  return s.replace(wordPattern, word => capitalizeFirstLetter(word));
}

const defaultShortSmalls = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'de', 'del', 'for', 'for', 'from',
  'in', 'into', 'la', 'le', 'near', 'nor', 'of', 'on', 'onto', 'or', 'the', 'to', 'with']);
const specialsRaw = ['eBay', 'FedEx', 'iCloud', 'iMac', 'iOS', 'iPad', 'iPhone', 'MacBook', 'macOS', 'PepsiCo', 'watchOS'];
const defaultSpecials = new Map<string, string>();

specialsRaw.forEach(word => defaultSpecials.set(toCanonicalLowercase(word), word));

export interface TitleCaseOptions {
  keepAllCaps?: boolean;
  shortSmall?: string[];
  special?: string[];
}

export function toTitleCase(s: string, options?: TitleCaseOptions): string {
  options = options ?? {};

  let shortSmalls = defaultShortSmalls;
  let specials = defaultSpecials;
  const firstNonSpaceIndex = (/^\s*/.exec(s)!)[0]?.length;
  const lastNonSpaceIndex = s.length - ((/\s*$/.exec(s)!)[0]?.length || 0);

  if (options.shortSmall) {
    shortSmalls = new Set(shortSmalls);
    options.shortSmall.forEach(word => {
      if (word.startsWith('-'))
        shortSmalls.delete(word.substring(1));
      else
        shortSmalls.add(word);
    });
  }

  if (options.special) {
    specials = new Map(specials);
    options.special.forEach(word => {
      const lcWord = toCanonicalLowercase(word);

      if (word.startsWith('-'))
        specials.delete(lcWord.substring(1));
      else
        specials.set(lcWord, word);
    });
  }

  const wordHandler = (word: string, offset: number): string => {
    if (options?.keepAllCaps && isAllUppercase(word))
      return word;

    const lcWord = toCanonicalLowercase(word);

    if (specials.has(lcWord))
      return specials.get(lcWord) as string;

    word = capitalizeFirstLetter(word);

    const atStartOrEnd = (offset === firstNonSpaceIndex || offset === lastNonSpaceIndex - word.length);

    if (!atStartOrEnd && shortSmalls.has(lcWord))
      word = word.toLowerCase(); // Turn to lowercase again to keep original apostrophe forms.

    return word;
  };

  return s.replace(wordPattern, wordHandler);
}

export function padLeft(item: number, length: number, padChar?: string): string;
/**
 * @deprecated String.padStart() now available.
 */
export function padLeft(item: string, length: number, padChar?: string): string;
export function padLeft(item: string | number, length: number, padChar = ' '): string {
  let sign = '';

  if (!/^\s$/.test(padChar) && typeof item === 'number' && item < 0 && padChar === '0') {
    sign = '-';
    item = -item;
    --length;
  }

  let result = String(item);

  while (result.length < length)
    result = padChar + result;

  return sign + result;
}

/**
 * @deprecated String.padEnd() now available.
 */
export function padRight(item: string, length: number, padChar?: string): string {
  if (!padChar)
    padChar = ' ';

  while (item.length < length)
    item += padChar;

  return item;
}

export function replace(str: string, searchStr: string, replaceStr: string, caseInsensitive = false): string {
  // escape regexp special characters in search string
  searchStr = regexEscape(searchStr);

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

    if (cc < 0xC0) {} // Do nothing
    else if (0x100 <= cc && cc <= 0x17F) // Various Latin Extended A
      ch2 = latinExtendedASubstitutions.charAt(cc - 0x100);
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

export function stripDiacriticals(s: string): string {
  if (s)
    return s.normalize('NFD').replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF]/g, '').replace(/Ø/g, 'O').replace(/ø/g, 'o');
  else
    return s;
}

export function stripDiacriticals_lc(s: string): string {
  if (s)
    return stripDiacriticals(s).toLowerCase();
  else
    return s;
}

export function stripDiacriticals_UC(s: string): string {
  if (s)
    return stripDiacriticals(s).toUpperCase();
  else
    return s;
}

export function zeroPad(n: number | string, digits: number): string {
  const s = n.toString();

  return '0'.repeat(Math.max(0, digits - s.length)) + s;
}

// The \ escape before the second [ is considered unnecessary here by ESLint,
// but being left out is an error for some regex parsers.
const charsNeedingRegexEscape = /[-\[\]/{}()*+?.\\^$|]/g;

export function regexEscape(s: string): string {
  return s.replace(charsNeedingRegexEscape, '\\$&');
}

const digitSystems: [number, string][] = [
  [0x0660, 'Arabic'],
  [0x06F0, 'Extended Arabic'],
  [0x07C0, "N'Ko"],
  [0x0966, 'Devanagari'],
  [0x09E6, 'Bengali'],
  [0x0A66, 'Gurmukhi'],
  [0x0AE6, 'Gujarati'],
  [0x0B66, 'Oriya'],
  [0x0BE6, 'Tamil'],
  [0x0C66, 'Telugu'],
  [0x0CE6, 'Kannada'],
  [0x0D66, 'Malayalam'],
  [0x0DE6, 'Sinhala Lith'],
  [0x0E50, 'Thai'],
  [0x0ED0, 'Lao'],
  [0x0F20, 'Tibetan'],
  [0x1040, 'Myanmar'],
  [0x1090, 'Myanmar Shan'],
  [0x17E0, 'Khmer'],
  [0x1810, 'Mongolian'],
  [0x1946, 'Limbu'],
  [0x19D0, 'New Tai Lue'],
  [0x1A80, 'Tai Tham Hora'],
  [0x1A90, 'Tai Tham Tham'],
  [0x1B50, 'Balinese'],
  [0x1BB0, 'Sundanese'],
  [0x1C40, 'Lepcha'],
  [0x1C50, 'Ol Chiki'],
  [0xA620, 'Vai'],
  [0xA8D0, 'Saurashtra'],
  [0xA900, 'Kayah Li'],
  [0xA9D0, 'Javanese'],
  [0xA9F0, 'Myanmar Tai Laing'],
  [0xAA50, 'Cham'],
  [0xABF0, 'Meetei Mayek'],
];

const digitValues: Record<string, string> = {};
const digitBases: Record<string, string> = {};
const digitScripts: Record<string, string> = {};

for (const [base, script] of digitSystems) {
  const zero = String.fromCodePoint(base);

  for (let i = 0; i <= 9; ++i) {
    const digit = String.fromCodePoint(base + i);

    digitValues[digit] = String.fromCodePoint(0x30 + i);
    digitBases[digit] = zero;
    digitScripts[digit] = script;
  }
}

export function convertDigitsToAscii(n: string, info?: string[]): string {
  let base = '0';
  let script = 'ASCII';

  const result = n.replace(/./g, match => {
    if (digitValues[match]) {
      base = digitBases[match];
      script = digitScripts[match];

      return digitValues[match];
    }

    return match;
  });

  if (info) {
    info[0] = base;
    info[1] = script;
  }

  return result;
}

export function convertDigits(n: string, baseDigit: string): string {
  const base: string[] = [];
  const latn = convertDigitsToAscii(n, base);

  if (base[0] !== baseDigit) {
    const delta = baseDigit.charCodeAt(0) - 48;

    n = latn.replace(/\d/g, ch => String.fromCodePoint(ch.charCodeAt(0) + delta));
  }

  return n;
}

export function isDigit(ch: string): boolean {
  ch = ch?.charAt(0);

  return digitPattern.test(ch) || !!digitValues[ch];
}

export function digitScript(ch: string | null | undefined): string | undefined {
  ch = ch?.charAt(0);

  return digitScripts[ch ?? ''] || (/^\d$/.test(ch ?? '') ? 'ASCII' : undefined);
}

export function toMaxFixed(n: number, maximumFractionDigits: number, locale?: string, useGrouping = false): string {
  return new Intl.NumberFormat(locale || 'en-US', { maximumFractionDigits, useGrouping }).format(n);
}

export function toMaxSignificant(n: number, maximumSignificantDigits: number, locale?: string | null, useGrouping = false): string {
  return new Intl.NumberFormat(locale || 'en-US', { maximumSignificantDigits, useGrouping }).format(n);
}

export function checksum53(s: string, seed = 0): string {
  let h1 = 0xDEADBEEF ^ seed;
  let h2 = 0x41C6CE57 ^ seed;

  s = s.normalize();

  for (let i = 0, ch: number; i < s.length; ++i) {
    ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase().padStart(14, '0');
}
