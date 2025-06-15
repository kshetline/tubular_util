### 4.18.0

* Added `debounce` and `throttle` functions.
* Improved sourcemaps.
* CHANGELOG.md started (earlier changes listed added retroactively).

### 4.17.0

* New functions (`sleep`, `getCssVariable`, `setCssVariable`).
* Better segregation of browser-related testing for 100% testing coverage.
* substr forever!
* Documentation updates.

### 4.16.1

Added new functions: `checksum53`, `getOrSet`, `getOrSetAsync`, `numSort`, `reverseNumSort`, `nfe`, `ufe`.

### 4.13.0

* Added full documentation.
* Implemented TypeScript strict null checking.
* Added `regex` tagged template for flexible formatting and commenting of regular expressions.
* Added `defaultValue` option to `first`, `nth`, and `last`.
* Updated `clone` function to clone symbol properties.
* Added `stokeWidth` option to `drawOutlinedText`.
* Added `duration` option to `beep`.
* Added `beepPromise` function.
* Added `forEach2` function to loop through all properties of an object, including symbol properties.

### 4.10.0

* Improved word boundary recognition for `toMixedCase()` and `toTitleCase()` functions.
* Added `fillCircle()` and `keyCount()` functions.
* Added `trimEachLine` option to `asLines()`.
* Deprecated `padLeft()` and `padRight()`.

### 4.9.2

* Added optional frequency and gain to `beep()`.
* Fixed broken `isRaspbian()` function.
* Updated `isMacOS()` so it isn't as easily fooled by a fake user agent from an iOS device.
* Updated `isLikelyMobile()` so it isn't tricked by fake iPad macOS user agent.
* Added functions: `stripDiacriticals()`, `stripDiacriticals_lc()`, `stripDiacriticals_UC()`, `toMaxFixed()`, and `toMaxSignificant()`.

### 4.7.1

Added isLikelyMobile() function.

### 4.6.0

* Added `encodeForUri()` function (improved version of `encodeURIComponent`, escaping more characters and with option for spaces as pluses).
* Updated `urlEncodeParams()` to use `encodeForUri()`.
* Added `iosVersion()` and `isIOS14OrEarlier()` functions.
* Added isValidJson()` function.
* Added `forFileName` parameter to `makePlainASCII_lc()` and `makePlainASCII_UC()`.

### 4.5.1

* Added `isChromeOS()` function.
* Added `extraAscent`, `extraDescent`, and `extraLineHeight` fields to `FontMetrics`, the return result from `getFontMetrics()`.
* `getFontMetrics()` can now return metrics for a specific character rather than the font in general.
* Added `getCssRuleValue()` and `getCssRuleValues()` functions.
* Expanded the range of Unicode digits which can be translated and classified using `convertDigitsToAscii()` and `convertDigits()`, `isDigit()`.
* Added `isDigit()` and `digitScript()` functions.
