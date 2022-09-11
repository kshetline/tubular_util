# @tubular/util

An assortment of general-purpose utility functions, including string manipulation, non-exception-throwing safe string-to-number conversions, array functions, object cloning, web browser graphics and CSS support, and more.

## Installation

### Via npm

`npm install @tubular/util`

`import { toBoolean, toNumber, compareCaseSecondary`...`} from '@tubular/time'; // ESM`

...or...

`const { toBoolean, toNumber, compareCaseSecondary`...`} = require('@tubular/time/cjs'); // CommonJS`

Documentation examples will assume **@tubular/util** has been imported as above.

### Via `<script>` tag

To remotely download the full code as an ES module:

```html
<script type="module">
  import('https://unpkg.com/@tubular/util/dist/fesm2015/index.mjs').then(pkg => {
    const { toBoolean, toNumber, compareCaseSecondary } = pkg;

    // ...
  });
</script>
```

For the old-fashioned UMD approach:

```html
<script src="https://unpkg.com/@tubular/util/dist/umd/index.js"></script>
```

The **@tubular/util** package will be available via the global variable `tbUtil`. Functions, classes, and constants will also be available on this variable, such as `tbUtil.toBoolean`, `tbUtil.toNumber`, `tbUtil.compareCaseSecondary`, etc.

## String functions

```typescript
function asLines(s: string, trimFinalBlankLines = false, trimEachLine = false): string[]
```
Takes a string containing line breaks (LF, CR, or CRLF) and turns it into an array of individual lines. Optionally final blank lines can be omitted, and each line can optionally have leading and trailing white space trimmed.


```typescript
function compareCaseInsensitive(a: string, b: string): number;
```

Compares two strings in a case-insensitive manner, returning a less-than-zero value if `a` is less than `b`, a greater-than-zero value if `a` is greater than `b`, or 0 if the strings are (apart from case) identical.


```typescript
function compareCaseSecondary(a: string, b: string): number;
```

Compares two strings in the same manner as `compareCaseInsensitive`, but if both strings are equal in a case-insensitive manner, case is then taken into consideration, and 0 is only returned if `a` and `b` are completely identical.

```typescript
function compareStrings(a: string, b: string): number;
```

Compares two strings, returning a less-than-zero value if `a` is less than `b`, a greater-than-zero value if `a` is greater than `b`, or 0 if the strings are identical.

```typescript
function extendDelimited(base: string, newItem: string, delimiter = ', '): string;
```

Appends one string to another string, inserting a `delimiter` in between if the first string in not an empty string.

```typescript
function makePlainASCII(s: string, forFileName = false): string;
```
Converts `s` to a string containing only ASCII characters, making substitutions where possible with unaccented ASCII characters, dashes, or underscores.

If `forFileName` is true, characters which are disallowed or problematic in file names (such as asterisks, slashes, colons, etc.) are also replaced.

```typescript
function makePlainASCII_lc(s: string, forFileName = false): string;
```

Same as `makePlainASCII`, but also converted to lowercase.

```typescript
function makePlainASCII_UC(s: string, forFileName = false): string;
```

Same as `makePlainASCII`, but also converted to uppercase.

```typescript
function isAllUppercase(s: string): boolean;
```

Returns `true` if `s` contains nothing other than one or more uppercase characters.

```typescript
function isAllUppercaseWords(s: string): boolean;
```

Returns `true` if `s` is non-empty, contains at least one uppercase character, and contains no lowercase characters.

```typescript
function toMixedCase(s: string): string;
```

Capitalizes the first letter in each word in `s`, converting all other letters to lowercase.

```typescript
function toTitleCase(s: string, options?: TitleCaseOptions): string;
```

This function works much like `toMixedCase`, but also makes a _simplified_ attempt to follow English capitalization rules for titles, leaving short words (which are neither the first word nor the last word) in lowercase, such as "and", "or", "to", "the", etc.

These options are available:

> `interface TitleCaseOptions {`<br>
`  keepAllCaps?: boolean;`<br>
`  shortSmall?: string[];`<br>
`  special?: string[];`<br>
`}`

If `keepAllCaps` is `true`, any word that is originally fully capitalized remains fully capitalized, such as "USA".

`shortSmall` is a list of additional words that you wish not to be capitalized, in additions to the built-in list. You can also delete words from the built-in list by including them here with a leading dash, e.g. "-and" to allow the word "and" to be capitalized even when it is not the first or last word of a title.

`special` is a list of words that you wish to provide special capitalization rules for, such as "CinemaScope" or "MacDougall". Some of these are built in, such as "FedEx" and "iOS".

```typescript
function replace(str: string, searchStr: string, replaceStr: string, caseInsensitive = false): string;
```

JavaScript’s own string `replace` method only replaces one occurrence of a string with another string unless you use a regex with the `g` flag for the search string. This function replaces all occurrences without having to use a regex or worry about escaping any string characters. Matching can optionally be case-insensitive.

```typescript
function stripLatinDiacriticals(s: string): string;
```

Removes diacritical marks from all Latin 1 and Latin Extended characters, as well as removing all combining diacritical marks (regardless of whether they are combined with a Latin letter or not).

```typescript
function stripLatinDiacriticals_lc(s: string): string;
```

Same as `stripLatinDiacriticals`, but the results are also converted to lowercase.

```typescript
function stripLatinDiacriticals_UC(s: string): string;
```

Same as `stripLatinDiacriticals`, but the results are also converted to uppercase.

```typescript
function stripDiacriticals(s: string): string;
```

Removes diacritical marks from a wide range of alphabetic scripts, as well as removing all combining diacritical marks.

```typescript
function stripDiacriticals_lc(s: string): string;
```

Same as `stripDiacriticals`, but the results are also converted to lowercase.

```typescript
function stripDiacriticals_UC(s: string): string;
```

Same as `stripDiacriticals`, but the results are also converted to uppercase.

```typescript
function zeroPad(n: number | string, digits: number): string;
```

Taking either a number or a string for `n`, a string is returned with `digits` digits, padded with leading zeros as needed. This should only be used for non-negative integer values.

```typescript
function regexEscape(s: string): string;
```

Returns a representation of `s` which can be used by `RegExp`, automatically escaped so that all characters are interpreted as literal characters, not regex syntax.

```typescript
function convertDigitsToAscii(n: string, baseDigit?: string[]): string;
```

Converts decimal digits in various scripts (Arabic, Devanagari, Mongolian, etc.) into ASCII digits.

If the optional array `baseDigit` is passed, `baseDigit[0]` will be modified to contain the 0 digit for the last script detected, and `baseDigit[0]` will be modified to contain the name of that script.

These scripts are supported:

> Arabic, ASCII, Balinese, Bengali, Cham, Devanagari, Extended Arabic, Gujarati, Gurmukhi, Javanese, Kannada, Kayah Li, Khmer, Lao, Lepcha, Limbu, Malayalam, Meetei Mayek, Mongolian, Myanmar, Myanmar Shan, Myanmar Tai Laing, N'Ko, New Tai Lue, Ol Chiki, Oriya, Saurashtra, Sinhala Lith, Sundanese, Tai Tham Hora, Tai Tham Tham, Tamil, Telugu, Thai, Tibetan, Vai

```typescript
function convertDigits(n: string, baseDigit: string): string;
```

Converts decimal digits in various scripts (Arabic, Devanagari, Mongolian, etc.) into digits in a different script, where `baseDigit` is the desired representation for 0. The default value for `baseDigit` is the ASCII digit zero.

```typescript
function isDigit(ch: string): boolean;
```

Returns `true` if `ch` is recognized as a Unicode digit.

```typescript
function digitScript(ch: string | null | undefined): string | undefined;
```

Returns the name of the script for the digit contained in first character of `ch`, or `undefined`.

```typescript
function toMaxFixed(n: number, maximumFractionDigits: number, locale?: string, useGrouping = false): string;
```

Using `Intl.NumberFormat`, this returns a number as a string with a given `maximumFractionDigits`, using an optional `locale` (defaults to "en-US"). Unlike `toFixed`, fractional digits are not padded with trailing zeros.

If `useGrouping` is true, locale-specific grouping with be performed, such as the commas added to "12,345,678.9012" in the 'en-US' locale.

```typescript
function toMaxSignificant(n: number, maximumSignificantDigits: number, locale?: string | null, useGrouping = false): string;
```

Using `Intl.NumberFormat`, this returns a number as a string with a given `maximumSignificantDigits`, using an optional `locale` (defaults to "en-US"). Unlike `toPrecision`, formatting does not switch to scientific notation when more than `maximumSignificantDigits` are needed for the integer portion of a value.

If `useGrouping` is true, locale-specific grouping with be performed, such as the commas added to "12,345,700" in the 'en-US' locale.

```typescript
function processMillis(): number;
```

This is a platform-neutral method to return the current process running time, returning `performance.now()` in a web browser environment, or `process.hrtime()`, converted into milliseconds (and derived from the `bigint` form if available) in a Node.js environment. The function falls back on `Date.now()` if neither of the previous options are available.


```typescript
export function formatDateTime(options?: DateTimeOptions[]): string;
export function formatDateTime(date: Date | number | string, ...options: DateTimeOptions[]): string;
export function formatDateTime(date: Date | number | string, options?: DateTimeOptions[]): string;
```

This function returns date/time strings in basic ISO 8601 format, for either the local time zone or for UTC. The default time value is the current time. The default format is date and time at one-second resolution, with UTC offset included, e.g. `2022-08-07 16:12:43 -0400`.

The following options can be applied either as an array of options, or as a variable list of parameters after the `date` parameter:

* `DATE_ONLY`: Date only, e.g. `2022-08-07`.
* `NO_SECONDS`: Hide seconds, e.g. `2022-08-07 16:12 -0400`.
* `NO_ZONE`: Hide the UTC offset, e.g. `2022-08-07 16:12:43`.
* `TIME_ONLY`: Time only, e.g. `16:12:43 -0400`.
* `UTC`: Use UTC instead of the default local timezone, e.g. `2022-08-07 20:12:43 +0000`.
* `USE_T`: Use `T` between date and time, e.g. `2022-08-07T16:12:43 -0400`
* `USE_Z`: Use `Z` to indicate UTC time and drop timezone offset, e.g. `2022-08-07 20:12:43Z`. Implies `UTC` option.
* `WITH_MILLIS`: Add milliseconds, e.g. `2022-08-07 16:12:43.095 -0400`.

> `enum DateTimeOptions { DATE_ONLY, NO_SECONDS, NO_ZONE, TIME_ONLY, UTC, USE_T, USE_Z, WITH_MILLIS }`


```typescript
function toDefaultLocaleFixed(n: number, minFracDigits?: number, maxFracDigits?: number): string;
```

Converts a number to a formatted string, using localized rules for decimal marks and grouping (such as `1,234,567.89` vs `1 234 567,89`), with an optional minimum and maximum numbers of fractional digits.

```typescript
function toBoolean(value: any, defaultValue?: boolean, forHtmlAttribute?: boolean): boolean;
function toBoolean(value: any, defaultValue: null, forHtmlAttribute?: boolean): boolean | null;
```

Converts any `value` of any type to a `boolean` value (or possibly `null`, if `defaultValue` is `null`).

* `null`, `undefined`, or `NaN` becomes `defaultValue` (the default `defaultValue` is `false`).
* Any non-zero number (represented as `number` or `string`), `'true'`, `'t'`, `'yes'`, or `'y'` (case insensitive) are all considered `true`.
* Zero, `'false'`, `'f'`, `'no'`, or `'n'` (case insensitive) are all considered `false`.
* An empty string becomes `defaultValue` unless the `forHtmlAttribute` option is `true`, in which case an empty string means `true`.
* Anything other `value` which is not of type `number` or `string` is converted to `!!value`.

```typescript
function toInt(value: any, defaultValue?: number, radix?: number): number;
function toInt(value: any, defaultValue: null, radix?: number): null;
```

Converts any `value` of any type to a integer `number` (or possibly `null`, if `defaultValue` is `null`).

* Any `value` of type `number` is returned as `Math.floor(value)`.
* `null`, `undefined`, or `NaN` becomes `defaultValue` (the default `defaultValue` is 0).
* Any `value` of type `string` _composed completely of valid digits_ for the given `radix` (default 10) is returned as `parseInt(value, radix)`, unless the result of `parseInt` is `NaN` or an infinite value, in which case `defaultValue` is returned.
* Any other `string` value results in `defaultValue`.
* Any `value` of type `bigint` is returned as `Number(value)`, unless the result of `Number` is `NaN` or an infinite value, in which case `defaultValue` is returned.
* Any other type of `value` results in `defaultValue`.

```typescript
function toValidInt(value: any, defaultValue = 0, radix = 10): number;
```

This function returns the same results as `toInt` unless `value` is `NaN` or an infinite, in which case a non-null `defaultValue` is returned.

```typescript
function toNumber(value: any, defaultValue?: number): number;
function toNumber(value: any, defaultValue: null): number | null;
```

Converts any `value` of any type to a `number` (or possibly `null`, if `defaultValue` is `null`).

* Any `value` of type `number` is returned as itself.
* `null`, `undefined`, or `NaN` becomes `defaultValue` (the default `defaultValue` is 0).
* Any `value` of type `string` is returned as `parseFloat(value)`, unless the result of `parseFloat` is `NaN` or an infinite value, in which case `defaultValue` is returned.
* Any `value` of type `bigint` is returned as `Number(value)`, unless the result of `Number` is `NaN` or an infinite value, in which case `defaultValue` is returned.
* Any other type of `value` results in `defaultValue`.

```typescript
function toValidNumber(value: any, defaultValue = 0): number
```

This function returns the same results as `toNumber` unless `value` is `NaN` or an infinite, in which case `defaultValue` is returned.

```typescript
function first<T>(array: ArrayLike<T> | null | undefined): T | undefined
```

```typescript
function nth<T>(array: ArrayLike<T> | null | undefined, index: number): T | undefined
```

```typescript
function last<T>(array: ArrayLike<T> | null | undefined): T | undefined;
```

```typescript
function push<T>(array: T[] | null | undefined, ...items: any[]): T[];
```

```typescript
function pushIf<T>(condition: boolean, array: T[] | null | undefined, ...items: any[]): T[];
```

```typescript
function forEach<T>(obj: Record<string, T> | null | undefined, callback: (key: string, value: T) => void): void;
```

```typescript
function isArray(a: unknown): a is any[];
```

```typescript
function isArrayLike(a: unknown): a is ArrayLike<any>;
```

```typescript
function isBigint(a: unknown): a is bigint;
```

```typescript
function isBoolean(a: unknown): a is boolean

function isFunction(a: unknown): a is Function;
```

```typescript
function isNonFunctionObject(a: unknown): a is Exclude<Record<string | number | symbol, any>, Function>;
```

```typescript
function isNumber(a: unknown): a is number;
```

```typescript
function isObject(a: unknown): a is Record<string | number | symbol, any>;
```

```typescript
function isString(a: unknown): a is string;
```

```typescript
function isSymbol(a: unknown): a is symbol;
```

```typescript
function classOf(a: unknown, noClassResult = false): string | null;
```

```typescript
function clone<T>(orig: T, shallow: boolean | Set<any> | ((value: any, depth: number) => boolean) = false): T;
```

```typescript
function isEqual(a: any, b: any, mustBeSameClass = false): boolean;
```

```typescript
function flatten(a: any[]): any[];
```

```typescript
function flattenDeep(a: any[]): any[];
```

```typescript
function sortObjectEntries<T>(obj: T, inPlace?: boolean): T;
```

```typescript
function sortObjectEntries<T>(obj: T, sorter?: EntrySorter, inPlace?: boolean);
```

```typescript
function sortObjectEntries<T>(obj: T, sorterOrInPlace?: boolean | EntrySorter, inPlace = false): T;
```


const noop = (..._args: any[]): void => {};

const repeat = (n: number, f: (n?: number) => any): void => { while (n-- > 0) f(n); };

```typescript
function isValidJson(s: string): boolean;
```

```typescript
function keyCount(obj: any): number;
```

```typescript
function regex(main: TemplateStringsArray, flags?: string): RegExp;
```


interface FontMetrics {
  font: string;
  lineHeight: number;
  ascent: number;
  fullAscent: number;
  descent: number;
  leading: number;
  extraAscent?: number;
  extraDescent?: number;
  extraLineHeight?: number;
}

```typescript
function beep(frequency = 440, gainValue = 0.025): void;
```

```typescript
function eventToKey(event: KeyboardEvent): string;
```

```typescript
function getCssValue(element: Element, property: string): string;
```

```typescript
function getCssValues(element: Element, properties: string[]): string[];
```

```typescript
function getCssRuleValue(element: Element, property: string): string | undefined;
```

```typescript
function getCssRuleValues(element: Element, properties: string[]): string[] | undefined;
```

```typescript
function getFont(element: Element): string;
```

```typescript
function getFontMetrics(elementOrFont: Element | string, specificChar?: string): FontMetrics;
```

```typescript
function doesCharacterGlyphExist(elementOrFont: Element | string, charOrCodePoint: string | number): boolean;
```

```typescript
function getTextWidth(items: string | string[], font: string | HTMLElement, fallbackFont?: string): number;
```

```typescript
function htmlEscape(s: string, escapeQuotes = false): string;
```

```typescript
function htmlUnescape(s: string): string;
```

```typescript
function isAndroid(): boolean;
```

```typescript
function isChrome(): boolean;
```

```typescript
function isChromeOS(): boolean;
```

```typescript
function isChromium(): boolean;
```

```typescript
function isChromiumEdge(): boolean;
```

```typescript
function isEdge(): boolean;
```

```typescript
function isFirefox(): boolean;
```

```typescript
function isFullScreen(): boolean;
```

```typescript
function isEffectivelyFullScreen(): boolean;
```

```typescript
function isIE(): boolean;
```
 // @deprecated

```typescript
function isIOS(): boolean;
```

```typescript
function iosVersion(): number;
```

```typescript
function isIOS14OrEarlier(): boolean;
```

```typescript
function isLikelyMobile(): boolean;
```

```typescript
function isMacOS(): boolean;
```

```typescript
function isOpera(): boolean;
```

```typescript
function isRaspbian(): boolean;
```

```typescript
function isSafari(): boolean;
```

```typescript
function isSamsung(): boolean;
```

```typescript
function isWindows(): boolean;
```

```typescript
function restrictPixelWidth(text: string, font: string | HTMLElement, maxWidth: number, clipString = '\u2026'): string;
```

```typescript
function setFullScreen(full: boolean): void;
```

```typescript
function setFullScreenAsync(full: boolean, throwImmediate = false): Promise<void>;
```

```typescript
function toggleFullScreen(): void;
```

```typescript
function toggleFullScreenAsync(throwImmediate = false): Promise<void>;
```

```typescript
function encodeForUri(s: string, spaceAsPlus = false): string;
```

```typescript
function urlEncodeParams(params: Record<string, string | number | boolean | null>, spaceAsPlus = false): string;
```

```typescript
function blendColors(color1: string, color2: string, portion1 = 0.5): string;
```

```typescript
function colorFrom24BitInt(i: number, alpha = 1.0): string;
```

```typescript
function colorFromByteArray(array: number[], offset: number): string;
```

```typescript
function colorFromRGB(r: number, g: number, b: number, alpha = 1.0): string;
```

```typescript
function drawOutlinedText(context: CanvasRenderingContext2D, text: string, x: number, y: number,
                                 outlineStyle?: string, fillStyle?: string): void;
```

```typescript
function fillEllipse(context: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void;
```

```typescript
function fillCircle(context: CanvasRenderingContext2D, cx: number, cy: number, r: number): void ;
```

```typescript
function getPixel(imageData: ImageData, x: number, y: number): number;
```


export interface RGBA {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

```typescript
function parseColor(color: string): RGBA;
```

```typescript
function replaceAlpha(color: string, newAlpha: number): string;
```

```typescript
function setPixel(imageData: ImageData, x: number, y: number, pixel: number): void;
```

```typescript
function strokeCircle(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void;
```

```typescript
function strokeEllipse(context: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void;
```

```typescript
function strokeLine(context: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void;
```








## Deprecated functions

```typescript
function padLeft(item: string | number, length: number, padChar = ' '): string;
```

```typescript
function padRight(item: string, length: number, padChar?: string): string;
```


