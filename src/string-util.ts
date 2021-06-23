let notLetterPattern: RegExp;
let allUpperPattern: RegExp;
let wordPattern: RegExp;

try {
  // I want these regexes to fail if not supported, so it takes a bit of obfuscation
  // to prevent Babel from transforming them into something that doesn't fail.
  /* eslint-disable prefer-regex-literals */
  const u = String.fromCharCode(117);
  'm&m'.split(new RegExp('(?<!4)[^\\' + 'p{L}]+', u));
  // This line reached if Unicode character classes and lookbehind both work.
  notLetterPattern = new RegExp('\\' + 'P{L}', 'g' + u);
  allUpperPattern = new RegExp('^\\' + 'p{Lu}+$', u);
  // eslint-disable-next-line no-misleading-character-class
  wordPattern = new RegExp(`(?:['’ʼ]|(?<=[-\\s,.:;"]|^))[\\` + `p{L}'’ʼ\\u0300-\\u036F]+\\b['’ʼ]?`, 'g' + u);
}
catch {
  notLetterPattern = /[A-ZÀ-ÖØ-ÿ]/ig;
  allUpperPattern = /^[A-ZÀ-ÖØ-Þ]+$/;
  // eslint-disable-next-line no-misleading-character-class
  wordPattern = /[A-Za-zÀ-ÖØ-ÿ'’ʼ\u0300-\u036F]+\b['’ʼ]?/g;
}

export function asLines(s: string, trimFinalBlankLines = false): string[] {
  if (s) {
    const lines = s.split(/\r\n|\r|\n/);

    if (trimFinalBlankLines)
      while (lines[lines.length - 1] === '')
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
// inspection SpellCheckingInspection

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

function capitalizeFirstLetter(s: string): string {
  if (s.length > 1 && /^['’ʼ]/.test(s))
    return s.charAt(0) + s.charAt(1).toUpperCase() + s.substr(2).toLowerCase();
  else
    return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
}

function toCanonicalLowercase(s: string): string {
  return s.toLowerCase().replace(/['’ʼ]/g, "'");
}

export function isAllUppercase(s: string): boolean {
  return s && allUpperPattern.test(s);
}

export function isAllUppercaseWords(s: string): boolean {
  return s && allUpperPattern.test(s.replace(notLetterPattern, ''));
}

export function toMixedCase(s: string): string {
  return s.replace(wordPattern, word => capitalizeFirstLetter(word));
}

const defaultShortSmalls = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'by', 'de', 'for', 'for', 'from',
  'in', 'into', 'near', 'nor', 'of', 'on', 'onto', 'or', 'the', 'to', 'with']);
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
  const firstNonSpaceIndex = /^\s*/.exec(s)[0].length;
  const lastNonSpaceIndex = s.length - /\s*$/.exec(s)[0].length;

  if (options.shortSmall) {
    shortSmalls = new Set(shortSmalls);
    options.shortSmall.forEach(word => {
      if (word.startsWith('-'))
        shortSmalls.delete(word.substr(1));
      else
        shortSmalls.add(word);
    });
  }

  if (options.special) {
    specials = new Map(specials);
    options.special.forEach(word => {
      const lcWord = toCanonicalLowercase(word);

      if (word.startsWith('-'))
        specials.delete(lcWord.substr(1));
      else
        specials.set(lcWord, word);
    });
  }

  const wordHandler = (word: string, offset: number): string => {
    if (options.keepAllCaps && isAllUppercase(word))
      return word;

    const lcWord = toCanonicalLowercase(word);

    if (specials.has(lcWord))
      return specials.get(lcWord);

    word = capitalizeFirstLetter(word);

    const atStartOrEnd = (offset === firstNonSpaceIndex || offset === lastNonSpaceIndex - word.length);

    if (!atStartOrEnd && shortSmalls.has(lcWord))
      word = word.toLowerCase(); // Turn to lowercase again to keep original apostrophe forms.

    return word;
  };

  return s.replace(wordPattern, wordHandler);
}

export function padLeft(item: string | number, length: number, padChar = ' '): string {
  let sign = '';

  if (typeof item === 'number' && (item as number) < 0 && padChar === '0') {
    sign = '-';
    item = -item;
    --length;
  }

  let result = String(item);

  while (result.length < length)
    result = padChar + result;

  return sign + result;
}

export function padRight(item: string, length: number, padChar?: string): string {
  if (!padChar)
    padChar = ' ';

  while (item.length < length)
    item += padChar;

  return item;
}

export function replace(str: string, searchStr: string, replaceStr: string, caseInsensitive = false): string {
  // escape regexp special characters in search string
  searchStr = searchStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

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

// The \ escape before the second [ is considered unnecessary here by ESLint,
// but being left out is an error for some regex parsers.
// eslint-disable-next-line no-useless-escape
const charsNeedingRegexEscape = /[-\[\]/{}()*+?.\\^$|]/g;

export function regexEscape(s: string): string {
  return s.replace(charsNeedingRegexEscape, '\\$&');
}

export function convertDigitsToAscii(n: string, baseDigit?: string[]): string {
  let base = '0';

  const result = n
    .replace(/[\u0660-\u0669]/g, ch => { base = '\u0660'; return String.fromCodePoint(ch.charCodeAt(0) - 0x0630); })  // Arabic digits
    .replace(/[\u06F0-\u06F9]/g, ch => { base = '\u06F0'; return String.fromCodePoint(ch.charCodeAt(0) - 0x06C0); })  // Urdu/Persian digits
    .replace(/[\u0966-\u096F]/g, ch => { base = '\u0966'; return String.fromCodePoint(ch.charCodeAt(0) - 0x0936); })  // Devanagari digits
    .replace(/[\u09E6-\u09EF]/g, ch => { base = '\u09E6'; return String.fromCodePoint(ch.charCodeAt(0) - 0x09B6); })  // Bengali digits
    .replace(/[\u0F20-\u0F29]/g, ch => { base = '\u0F20'; return String.fromCodePoint(ch.charCodeAt(0) - 0x0EF0); })  // Tibetan digits
    .replace(/[\u1040-\u1049]/g, ch => { base = '\u1040'; return String.fromCodePoint(ch.charCodeAt(0) - 0x1010); }); // Myanmarese digits

  if (baseDigit)
    baseDigit[0] = base;

  return result;
}

export function convertDigits(n: string, baseDigit: string): string {
  const base: string[] = [];

  n = convertDigitsToAscii(n, base);

  if (base[0] !== baseDigit) {
    const delta = baseDigit.charCodeAt(0) - 48;

    n = n.replace(/[0-9]/g, ch => String.fromCodePoint(ch.charCodeAt(0) + delta));
  }

  return n;
}
