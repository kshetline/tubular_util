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

Returns first element of an array, or `undefined` if appropriate.

```typescript
function nth<T>(array: ArrayLike<T> | null | undefined, index: number): T | undefined
```

Returns `index` element of an array, or `undefined` if appropriate.

```typescript
function last<T>(array: ArrayLike<T> | null | undefined): T | undefined;
```

Returns last element of an array, or `undefined` if appropriate.

```typescript
function push<T>(array: T[] | null | undefined, ...items: any[]): T[];
```

This is a form of `push` designed for chained operations, returning the array which has been modified. If `array` is `null` or `undefined` a new empty array is created and returns with the pushed `items`.

```typescript
function pushIf<T>(condition: boolean, array: T[] | null | undefined, ...items: any[]): T[];
```

The same as `push` above, except that `items` are pushed conditionally.

```typescript
function forEach<T>(obj: Record<string, T> | null | undefined, callback: (key: string, value: T) => void): void;
```

Iterate over all string key/value pairs in `obj`.

```typescript
function forEach2<T>(obj: Record<string | symbol, T> | null | undefined, callback: (key: string | symbol, value: T) => void): void;
```

Iterate over all key/value pairs in `obj`, including `symbol` keys.


```typescript
function isArray(a: unknown): a is any[];
```

Returns `true` if `a` is an array.

```typescript
function isArrayLike(a: unknown): a is ArrayLike<any>;
```

Returns `true` if `a` is array-like.

```typescript
function isBigint(a: unknown): a is bigint;
```

Returns `true` if `a` is a `bigint` value.

```typescript
function isBoolean(a: unknown): a is boolean
```

Returns `true` if `a` is a `boolean` value.

```typescript
function isFunction(a: unknown): a is Function;
```

Returns `true` if `a` is a function.

```typescript
function isNonFunctionObject(a: unknown): a is Exclude<Record<string | number | symbol, any>, Function>;
```

Returns `true` if `a` is a object which is not a function.

```typescript
function isNumber(a: unknown): a is number;
```

Returns `true` if `a` is a `number` value.

```typescript
function isObject(a: unknown): a is Record<string | number | symbol, any>;
```

Returns `true` if `a` is a an object. Unlike `typeof a === 'object'`, `isObject(null)` returns `false`.

```typescript
function isString(a: unknown): a is string;
```

Returns `true` if `a` is a `string` value.

```typescript
function isSymbol(a: unknown): a is symbol;
```

Returns `true` if `a` is a `symbol` value.

```typescript
function classOf(a: unknown, noClassResult = false): string | null;
```

If `a` is an instance of a class, the name of the class is returned. Otherwise `null` is returned.

```typescript
function clone<T>(orig: T, shallow: boolean | Set<Function> | ((value: any, depth: number) => boolean) = false): T;
```

This function clones a value or object. Any primitive `orig` value will simply be return as-is.

The `shallow` parameter controls which children of an object are either cloned or used as-is.

* When `shallow` is **`true`**: Only the root object will be converted into a new object reference. All descendant objects will retain their original reference values.
* When `shallow` is **`false`**: All objects, root and descendants, will be converted into a new object references.
* When `shallow` is a **`Set`**: All objects, root and descendants, will be converted into a new object references except for class instances of classes contained in `shallow`.
* When `shallow` is a **function**: The root object is always converted into a new object, but descendants are only cloned when the callback function, provided with the descendant `value` and its `depth` in object tree, returns `false`.

```typescript
function isEqual(a: any, b: any, mustBeSameClass = false): boolean;
```

This function determines if two values `a` and `b` are equal to each other, by deep comparison when necessary.

* As a first check, `a` and `b` are equal considered equal if `a === b || Object.is(a, b)` is `true`. Please note:
  | Equal?            | a = 0, b = -0 | a = NaN, b = NaN |
  | ----------------- | ------------- | ---------------- |
  | `a === b`         | true          | false            |
  | `Object.is(a, b)` | false         | true             |
  | `isEqual(a, b)`   | true          | true             |
* If `a` and `b` are not the same type (as determined by `typeof`), they are not considered equal.
* If one of `a` and `b` is an array, and the other is not, they are not considered equal.
* If `a` and `b` are both arrays, but of unequal length, they are not considered equal.
* If the `mustBeSameClass` is `true`, `a` and `b` must either be instances of the same class, or both must not be an instance of any class, otherwise they are not considered equal.
* Otherwise all object children/array slots of `a` and `b` must be equal, by recursive application of `isEqual`, for `a` and `b` to be considered equal, and neither `a` nor `b` can own a property or index that the other does not have. For example, `isEqual([1, , 3], [1, undefined, 3])` is `false`, even though `[1, , 3][1] === [1, undefined, 3][1]` is `true`.

```typescript
function flatten(a: any[]): any[];
```

This function “flattens” an array by replacing any arrays within an array with the children of that inner array. For example:

`flatten([1, [2, 3], 4]))` returns `[1, 2, 3, 4]`.

The original array is not altered.

```typescript
function flattenDeep(a: any[]): any[];
```

Same as `flatten`, except flattening is recursive. For example:

`flattenDeep([1, [2, [3, 4]], 5]))` returns `1, 2, 3, 4, 5]`.

```typescript
type EntrySorter = (a: [string | symbol, any], b: [string | symbol, any]) => number;

function sortObjectEntries<T>(obj: T, inPlace?: boolean): T;
function sortObjectEntries<T>(obj: T, sorter?: EntrySorter, inPlace?: boolean);
```

JavaScript objects function as *ordered* maps, with a consistently-maintained ordering of object properties. This function allows you to sort that order. By default, that sorting is ascending alphabetical using JavaScript default string collation. You can supply your own `sorter` to control how properties are ordered.

If `inPlace` is `true` (the default is `false`) `obj` itself will be returned by the function, modified by the sorting. Otherwise a new object with sorted properties is returned.

```typescript
const noop = (..._args: any[]): void => {};
```

A function that does nothing, useful as a no-operation function parameter.


```typescript
const repeat = (n: number, f: (n?: number) => any): void => { while (n-- > 0) f(n); };
```

A function that calls function `f` `n` times.

```typescript
function isValidJson(s: string): boolean;
```

Determines if `s` contains valid JSON by attempting to parse it, and returning `true` if parsing is successful.

```typescript
function keyCount(obj: any): number;
```

A convenience function equivalent to `Reflect.ownKeys(obj).length`.

```typescript
function regex(main: TemplateStringsArray, flags?: string): RegExp;
```

Used as a tag function, `regex` provides a way to format complicated regular expressions with line breaks, indentation, and `//`-style comments, where the formatting and comments will be filtered out of the regular expression which is returned.

For example, this complex pattern:

```
/^\s*(\d{5,6})\s+(\d\d-\d\d-\d\d)\s+(\d\d:\d\d:\d\d)\s+(\d\d)\s+(\d)\s+(\d)\s+([\d.]+)\s+UTC\(NIST\)\s+\*(\s*)$/
```

...can be represented like this:

```typescript
// Automated Computer Time Service (ACTS) format
regex`^\s*(\d{5,6}) // Modified Julian Date
       \s+(\d\d-\d\d-\d\d) // date, YY-MM-DD
       \s+(\d\d:\d\d:\d\d) // time, HH:mm:ss
       \s+(\d\d) // ST/DST code
       \s+(\d) // leap second
       \s+(\d) // DUT1
       \s+([\d.]+) // msADV
       \s+UTC\(NIST\) // label
       \s+\*(\s*)$ // On-Time Marker (OTM)
       ${'i'}`
```

The final `${'i'}` above is an example of the format for optionally passing regular expression flags, like the `i` for case-insensitive. The `//` for a comment, if not on a line by itself, must be preceded and followed by at least one space.

## Browser-oriented functions

```typescript
function beep(frequency = 440, gainValue = 0.025, duration = 100): void;
```

Plays a simple square-wave tone at the specified `frequency` and `gainValue` for a `duration` in given in milliseconds.

```typescript
async function beepPromise(frequency = 440, gainValue = 0.025, duration = 100): Promise<void>;
```

Same as `beep`, except that you can `await` the completion of the sound.

```typescript
function eventToKey(event: KeyboardEvent): string;
```

Turns keyboard events into consistent, browser-independent key codes.

In many circumstances, especially with up-to-date browsers, this function is redundant, returning the same value as `event.key`. But for cases where `event.key` is not provided and `event.charCode`, `event.keyCode`, or `event.which` need to be examined, or when `event.key` contains a non-standard value such as `'UIKeyInputLeftArrow'` instead of `'ArrowLeft'`, `eventToKey` helps provide a consistent result.

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
function isChromeOS(): boolean;
function isChromium(): boolean;
function isChromiumEdge(): boolean;
function isEdge(): boolean;
function isFirefox(): boolean;
function isIE(): boolean; // @deprecated, always false now since IE is not supported.
function isIOS(): boolean;
function iosVersion(): number; // Integer value, not boolean, major version only.
function isIOS14OrEarlier(): boolean;
function isLikelyMobile(): boolean;
function isMacOS(): boolean;
function isOpera(): boolean;
function isRaspbian(): boolean;
function isSafari(): boolean;
function isSamsung(): boolean;
function isWindows(): boolean;
```

The above functions test browser types, platforms, and OS environments.

Developers should depend mostly on feature testing rather than detection of browser types. Nevertheless, browser information is sometimes useful, or even necessary to work around particular browser bugs and quirks.

```typescript
function isFullScreen(): boolean;
```

Returns `true` if the programmatic full-screen is activated. Note that it is possible for a browser to be in full-screen mode by means that are not directly detectable.

```typescript
function isEffectivelyFullScreen(): boolean;
```

Returns `true` if the browser window's inner width and height match the host computer screen's width and height.

```typescript
function restrictPixelWidth(text: string, font: string | HTMLElement, maxWidth: number, clipString = '\u2026'): string;
```

Returns a string derived from `text`, truncated if necessary, such that the pixel width of the resulting string, as rendered in the given `font`, is equal to or less than `maxWidth`.

If `text` is truncated, it is done by removing characters from the end of the string, with `clipString` (default `…`) appended.

```typescript
function setFullScreen(full: boolean): void;
```

Put the web browser in full-screen mode if `full` is true, end full-screen mode if `full` is `false`. Failure is ignored.

```typescript
function setFullScreenAsync(full: boolean, throwImmediate = false): Promise<void>;
```

Put the web browser in full-screen mode if `full` is true, end full-screen mode if `full` is `false`. Failure can be detected either immediately or asynchronously.

```typescript
function toggleFullScreen(): void;
```

Toggle full-screen mode. Failure is ignored.

```typescript
function toggleFullScreenAsync(throwImmediate = false): Promise<void>;
```

Toggle full-screen mode. Failure can be detected either immediately or asynchronously.

```typescript
function encodeForUri(s: string, spaceAsPlus = false): string;
```

Similar to `encodeURIComponent`, except the characters `!'()*` are also %-encoded, and spaces can optionally be encoded as `+` instead of `%20`.

```typescript
function urlEncodeParams(params: Record<string, string | number | boolean | null>, spaceAsPlus = false): string;
```

This function turns the name/value pairs from `params` into a URL parameter list, with each value encoded using `urlEncodeParams`.

For example, `{ name: 'John Doe', points: 250, foo: null }` becomes `'name=John%20Doe&points=250'`.

```typescript
function blendColors(color1: string, color2: string, portion1 = 0.5): string;
```

Blends two CSS-style colors, in even proportions by default, using a weighted average of their respective RGBA components.

```typescript
function colorFrom24BitInt(i: number, alpha = 1.0): string;
```

Turns a numerically-encoded RGB color value `i` (in the form 0xRRGGBB) into a CSS color string in the form `'#RRGGBB'`, or, if `alpha` has a non-1 value, a color string in the form `'rgba(r, g, b, alpha)'`, where `r`, `g`, and `b` are the decimal equivalents of `RR`, `GG`, and `BB`

```typescript
function colorFromByteArray(array: number[], offset = 0): string;
```

Uses values from `array`, starting at the optional `offset`, to create a CSS color string. Values should be in the integer range 0-255, in the order red, green, blue, optionally followed by an integer 0-255 alpha value.

```typescript
function colorFromRGB(r: number, g: number, b: number, alpha = 1.0): string;
```

Returns a CSS color string based on integer `r`, `g`, and `b` values from 0-255, and an optional `alpha` value from 0-1.

```typescript
function drawOutlinedText(context: CanvasRenderingContext2D, text: string, x: number, y: number,
                          outlineStyle?: string, fillStyle?: string, strokeWidth = 4): void;
```

Draws outlined `text` at location `x`, `y` using the styles (usually simply colors) `outlineStyle` and `fillStyle`, which default to the current `strokeStyle` and `fillStyle`, respectively, if not specified.

Note that the `strokeWidth` (default value 4) determines the pixel width of the outline stroke, but that only about half of that width will be visible after filled text is drawn on top of the stroked text.

```typescript
function fillCircle(context: CanvasRenderingContext2D, cx: number, cy: number, r: number): void ;
```

A method for drawing filled circles which is more convenient than using the standard `CanvasRenderingContext2D` arc and path methods.

```typescript
function fillEllipse(context: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void;
```

A method for drawing filled ellipses which is more convenient than using the standard `CanvasRenderingContext2D` arc and path methods.

```typescript
function getPixel(imageData: ImageData, x: number, y: number): number;
```

Extract the pixel value at `x`, `y` from `imageData`.

```typescript
export interface RGBA {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

function parseColor(color: string): RGBA;
```

Parse a CSS color string (including commonly recognized color names such as "orange" and "SteelBlue") and return the individual color components.

```typescript
function replaceAlpha(color: string, newAlpha: number): string;
```

Return a CSS color string equivalent to the originally provided `color`, but with its alpha value replaced with `newValue`.

```typescript
function setPixel(imageData: ImageData, x: number, y: number, pixel: number): void;
```

Set the pixel value at `x`, `y` in `imageData` to `pixel`.

```typescript
function strokeCircle(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void;
```
A method for drawing circles which is more convenient than using the standard `CanvasRenderingContext2D` arc and path methods.

```typescript
function strokeEllipse(context: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void;
```

A method for drawing ellipses which is more convenient than using the standard `CanvasRenderingContext2D` arc and path methods.

```typescript
function strokeLine(context: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void;
```

Draw a line from `x0`, `y0` to `x1`, `y1`.

## Deprecated functions

```typescript
function padLeft(item: string | number, length: number, padChar = ' '): string;
```

Equivalent to the now-preferred `String.prototype.padStart` method.

```typescript
function padRight(item: string, length: number, padChar?: string): string;
```

Equivalent to the now-preferred `String.prototype.padEnd` method.

