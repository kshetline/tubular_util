import { forEach, isNumber, toInt, toNumber } from './misc-util';

const { ceil, floor, max, min } = Math;

let _navigator: typeof navigator | undefined;

try {
  if (typeof navigator !== 'undefined')
    _navigator = navigator;
}
catch {}

/* istanbul ignore next */
if (!_navigator)
  _navigator = { appVersion: '?', maxTouchPoints: 0, platform: '?', userAgent: '?', vendor: '?' } as typeof navigator;

let _window: typeof window | undefined;

try {
  if (typeof window !== 'undefined')
    _window = window;
}
catch {}

export interface FontMetrics {
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

interface FsDocument extends Document {
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  msExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitFullscreenElement?: Element;
}

interface FsDocumentElement extends HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
}

export function beep(frequency = 440, gainValue = 0.025, duration = 100): void {
  beepPromise(frequency, gainValue, duration).finally();
}

export async function beepPromise(frequency = 440, gainValue = 0.025, duration = 100): Promise<void> {
  /* istanbul ignore next */
  if (!_window)
    return;

  return new Promise(resolve => {
    const audioContext = new ((_window as any).AudioContext)() as AudioContext;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.gain.value = gainValue;
    gain.connect(audioContext.destination);

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect();
      gain.disconnect();
      // noinspection JSIgnoredPromiseFromCall
      audioContext.close();
      resolve();
    }, duration);
  });
}

export function eventToKey(event: KeyboardEvent): string {
  let key = event.key;

  if (key === undefined) {
    // noinspection JSDeprecatedSymbols
    const charCode = event.charCode;

    if (charCode !== 0 && charCode != null) {
      key = String.fromCodePoint(charCode);
    }
    else {
      // noinspection JSDeprecatedSymbols
      const keyCode = event.keyCode || event.which;

      /* istanbul ignore next */
      switch (keyCode) {
        case   3: case 13: key = 'Enter'; break;
        case   8: key = 'Backspace'; break;
        case   9: key = 'Tab'; break;
        case  12: key = 'Clear'; break;
        case  16: key = 'Shift'; break;
        case  17: key = 'Control'; break;
        case  18: key = 'Alt'; break;
        case  19: key = 'Pause'; break;
        case  20: key = 'CapsLock'; break;
        case  27: key = 'Escape'; break;
        case  33: key = 'PageUp'; break;
        case  34: key = 'PageDown'; break;
        case  35: key = 'End'; break;
        case  36: key = 'Home'; break;
        case  37: key = 'ArrowLeft'; break;
        case  38: key = 'ArrowUp'; break;
        case  39: key = 'ArrowRight'; break;
        case  40: key = 'ArrowDown'; break;
        case  43: key = '+'; break;
        case  44: key = 'PrintScreen'; break;
        case  45: key = 'Insert'; break;
        case  46: key = 'Delete'; break;
        case  91: key = 'OS'; break;
        case  93: key = 'ContextMenu'; break;
        case 107: key = '+'; break;
        case 109: key = '-'; break;
        case 110: key = '.'; break;
        case 111: key = '/'; break;
        case 144: key = 'NumLock'; break;
        case 145: key = 'ScrollLock'; break;
        case 173: case 181: key = 'AudioVolumeMute'; break;
        case 174: case 182: key = 'AudioVolumeDown'; break;
        case 175: case 183: key = 'AudioVolumeUp'; break;
        case 179: key = 'MediaPlayPause'; break;
        case 186: key = ';'; break;
        case 187: key = '='; break;
        case 188: key = ','; break;
        case 189: key = '-'; break;
        case 191: key = '/'; break;
        case 192: key = '~'; break;
        case 219: key = '['; break;
        case 220: key = '\\'; break;
        case 221: key = ']'; break;
        case 222: key = '\''; break;
        case 224: key = 'Meta'; break;

        default:
          if (112 <= keyCode && keyCode <= 135)
            key = 'F' + (keyCode - 111);
          else if (48 <= keyCode && keyCode <= 90)
            key = String.fromCharCode(keyCode);
          else if (96 <= keyCode && keyCode <= 105)
            key = String.fromCharCode(keyCode - 48);
      }
    }
  }
  else {
    /* istanbul ignore next */
    switch (key) {
      case 'Left':
      case 'UIKeyInputLeftArrow':  key = 'ArrowLeft'; break;
      case 'Up':
      case 'UIKeyInputUpArrow':    key = 'ArrowUp'; break;
      case 'Right':
      case 'UIKeyInputRightArrow': key = 'ArrowRight'; break;
      case 'Down':
      case 'UIKeyInputDownArrow':  key = 'ArrowDown'; break;

      case 'Add':      key = '+'; break;
      case 'Subtract': key = '-'; break;
      case 'Multiply': key = '*'; break;
      case 'Divide':   key = '/'; break;
      case 'Decimal':  key = '.'; break;

      case 'Apps':     key = 'ContextMenu'; break;
      case 'Del ':     key = 'Delete'; break;
      case 'Esc':      key = 'Escape'; break;
      case 'Scroll':   key = 'ScrollLock'; break;
      case 'Spacebar': key = ' '; break;
      case 'Win':      key = 'Meta'; break;
    }
  }

  return key;
}

export function getCssValue(element: Element, property: string): string {
  return document.defaultView!.getComputedStyle(element, null).getPropertyValue(property);
}

export function getCssValues(element: Element, properties: string[]): string[] {
  const styles = document.defaultView!.getComputedStyle(element, null);

  return properties.map(p => styles.getPropertyValue(p));
}

export function getCssVariable(name: string): string {
  return (document.querySelector(':root') as HTMLElement).style.getPropertyValue(name);
}

export function setCssVariable(name: string, value: string): void {
  (document.querySelector(':root') as HTMLElement).style.setProperty(name, value);
}

export function getCssRuleValue(element: Element, property: string): string | undefined {
  return (getCssRuleValues(element, [property]))[0] || undefined;
}

export function getCssRuleValues(element: Element, properties: string[]): (string | undefined)[] {
  const stack: CSSStyleDeclaration[] = [];

  function searchRules(rules: CSSRuleList) {
    Array.from(rules ?? /* istanbul ignore next */ []).forEach(rule => {
      if (rule instanceof CSSMediaRule && _window?.matchMedia(rule.conditionText).matches)
        searchRules(rule.cssRules);
      else if (rule instanceof CSSSupportsRule) {
        try {
          if (CSS.supports(rule.conditionText))
            searchRules(rule.cssRules);
        }
        catch {}
      }
      else if (rule instanceof CSSStyleRule) {
        try {
          if (element.matches(rule.selectorText))
            stack.push(rule.style);
        }
        catch {}
      }
    });
  }

  Array.from(document.styleSheets ?? /* istanbul ignore next */ [])
    .forEach(sheet => searchRules(sheet.rules || /* istanbul ignore next */ sheet.cssRules));

  let results: (string | undefined)[] = properties.map(_p => undefined);
  let last: CSSStyleDeclaration | undefined;

  while ((last = stack.pop())) {
    const values = properties.map(p => last![p as any]);

    results = results.map((v, i) => v || values[i]);
  }

  return results;
}

const fontStretches: Record<string, string> = {
  '50%': 'ultra-condensed',
  '62.5%': 'extra-condensed',
  '75%': 'condensed',
  '87.5%': 'semi-condensed',
  '100%': 'normal',
  '112.5%': 'semi-expanded',
  '125%': 'expanded',
  '150%': 'extra-expanded',
  '200%': 'ultra-expanded'
};

export function getFont(element: Element): string {
  const style = document.defaultView!.getComputedStyle(element, null);
  let font = style.getPropertyValue('font');

  /* istanbul ignore next */ // Can't seem to force this situation to arise anymore.
  if (!font) {
    const fontStyle = style.getPropertyValue('font-style');
    const fontVariant = style.getPropertyValue('font-variant');
    const fontWeight = style.getPropertyValue('font-weight');
    const fontStretch = fontStretches[style.getPropertyValue('font-stretch')] || '';
    const fontSize = style.getPropertyValue('font-size');
    const lineHeight = style.getPropertyValue('line-height');
    const fontFamily = style.getPropertyValue('font-family');

    font = (
      fontStyle + ' ' +
      fontVariant + ' ' +
      fontWeight + ' ' +
      fontStretch + ' ' +
      fontSize + (lineHeight ? ' / ' + lineHeight : '') + ' ' +
      fontFamily
    ).replace(/ +/g, ' ').trim();
  }

  return font;
}

const cachedMetrics: {[font: string]: FontMetrics} = {};

export function getFontMetrics(elementOrFont: Element | string, specificChar?: string): FontMetrics {
  let font;

  if (typeof elementOrFont === 'string')
    font = elementOrFont as string;
  else
    font = getFont(elementOrFont as Element);

  let metrics: FontMetrics | false = !specificChar && cachedMetrics[font];

  if (metrics)
    return metrics;

  let testFont = font;
  let fontSize = 12;
  let testFontSize = 12;
  const fontParts = /(.*?\b)((?:\d|\.)+)(px\b.*)/.exec(font);

  // Double the font size so there's more pixel detail to scan, then scale down the result afterward.
  if (fontParts) {
    fontSize = parseFloat(fontParts[2]);
    testFontSize = fontSize * 2;
    testFont = fontParts[1] + testFontSize + fontParts[3];
  }

  const sampleText1 = 'Eg';
  const sampleText2 = 'ÅÊ';

  let lineHeight = fontSize * 1.2;
  const padding = min(50, lineHeight * 1.5);
  const heightDiv = document.createElement('div');

  heightDiv.style.position = 'absolute';
  heightDiv.style.opacity = '0';
  heightDiv.style.font = font;
  heightDiv.innerHTML = sampleText1 + '<br>' + sampleText1;
  document.body.appendChild(heightDiv);

  const heightDivHeight = parseFloat(getCssValue(heightDiv, 'height').replace('px', ''));

  if (heightDivHeight >= fontSize * 2)
    lineHeight = heightDivHeight / 2;

  document.body.removeChild(heightDiv);

  const canvas = (getFontMetrics as any).canvas || ((getFontMetrics as any).canvas =
                  document.createElement('canvas') as HTMLCanvasElement);

  canvas.width = testFontSize * 2 + padding;
  canvas.height = testFontSize * 3;
  canvas.style.opacity = '1';

  const context = canvas.getContext('2d', { willReadFrequently: true });
  const w = canvas.width, w4 = w * 4, h = canvas.height, baseline = h / 2;

  context.fillStyle = 'white';
  context.fillRect(-1, -1, w + 2, h + 2);
  context.fillStyle = 'black';
  context.font = testFont;
  context.fillText(sampleText1, padding / 2, baseline);

  let pixels = context.getImageData(0, 0, w, h).data;
  let i = 0;
  const len = pixels.length;

  // Finding the ascent uses a normal, forward scanline
  while (++i < len && pixels[i] > 192) {}
  let ascent = baseline - floor(i / w4);

  // Finding the descent uses a reverse scanline
  i = len - 1;
  while (--i > 0 && pixels[i] > 192) {}
  let descent = floor(i / w4) - baseline;

  context.fillStyle = 'white';
  context.fillRect(-1, -1, w + 2, h + 2);
  context.fillStyle = 'black';
  context.fillText(sampleText2, padding / 2, baseline);
  pixels = context.getImageData(0, 0, w, h).data;

  // Find full ascent, including diacriticals.
  i = 0;
  while (++i < len && pixels[i] > 192) {}
  let fullAscent = baseline - floor(i / w4);

  let extraAscent = fullAscent;
  let extraDescent = descent;

  if (specificChar) {
    context.fillStyle = 'white';
    context.fillRect(-1, -1, w + 2, h + 2);
    context.fillStyle = 'black';
    context.fillText(specificChar, padding / 2, baseline);
    pixels = context.getImageData(0, 0, w, h).data;

    // Find ascent of specificChar.
    i = 0;
    while (++i < len && pixels[i] > 192) {}
    extraAscent = max(floor(i / w4) - baseline, fullAscent);

    // Find descent of specificChar.
    i = len - 1;
    while (--i > 0 && pixels[i] > 192) {}
    extraDescent = max(floor(i / w4) - baseline, descent);
  }

  if (testFontSize > fontSize) {
    ascent = ceil(ascent / 2);
    fullAscent = ceil(fullAscent / 2);
    descent = ceil(descent / 2);
    extraAscent = ceil(extraAscent / 2);
    extraDescent = ceil(extraDescent / 2);
  }

  const leading = lineHeight - fullAscent - descent;

  metrics = { font, lineHeight, ascent, fullAscent, descent, leading };

  if (!specificChar)
    cachedMetrics[font] = metrics;
  else {
    metrics.extraAscent = extraAscent;
    metrics.extraDescent = extraDescent;
    metrics.extraLineHeight = max(extraAscent + extraDescent, lineHeight);
  }

  return metrics;
}

/* istanbul ignore next */ // Only sometimes called for checking glyphs on Firefox
function changeItalic(font: string): string {
  if (/\b(italic|oblique)\b/.test(font))
    return font.replace(/\b(italic|oblique)\b/, '');
  else
    return 'italic ' + font;
}

export function doesCharacterGlyphExist(elementOrFont: Element | string, charOrCodePoint: string | number): boolean {
  if (isNumber(charOrCodePoint))
    charOrCodePoint = String.fromCodePoint(charOrCodePoint);

  const self: any = doesCharacterGlyphExist;
  const firefox = isFirefox();
  const metrics = getFontMetrics(elementOrFont);
  const PADDING = 8;
  const size = metrics.lineHeight + PADDING;

  const canvas0 = self.canvas0 || (self.canvas0 = document.createElement('canvas') as HTMLCanvasElement);
  const canvas1 = self.canvas1 || (self.canvas1 = document.createElement('canvas') as HTMLCanvasElement);
  const canvas2 = self.canvas2 || (self.canvas2 = /* istanbul ignore next */ firefox && document.createElement('canvas') as HTMLCanvasElement);
  const canvases = [canvas0, canvas1, canvas2];
  const pixmaps: any[] = [];

  for (let i = 0; i < (/* istanbul ignore next */ firefox ? 3 : 2); ++i) {
    const canvas = canvases[i];

    canvas.width = size;
    canvas.height = size;
    canvas.style.opacity = '1';

    const context = canvas.getContext('2d', { willReadFrequently: true });

    context.fillStyle = 'white';
    context.fillRect(-1, -1, size + 2, size + 2);
    context.fillStyle = 'black';
    // Compare pixels for test character to pixels for known character without a glyph.
    // For Firefox, which renders missing glyphs all differently, check if a character
    // looks the same as itself when rendered in italics -- the missing glyph boxes
    // remain straight when italicized.
    /* istanbul ignore next */
    context.font = (i === 1 && firefox ? changeItalic(metrics.font) : metrics.font);
    /* istanbul ignore next */
    context.fillText(i === 0 || (firefox && i !== 2) ? charOrCodePoint : '\uFFFE', 0, metrics.fullAscent);

    pixmaps[i] = context.getImageData(0, 0, size, size).data;
  }

  for (let i = 0; i < pixmaps[0].length; i += 4) {
    if (pixmaps[0][i] !== pixmaps[1][i])
      return true;
  }

  // Italic font trick doesn't always help with Firefox, so take the extra step of looking for box edges.
  /* istanbul ignore next */
  if (firefox) {
    for (let i = 0; i < pixmaps[0].length; i += 4) {
      const row = floor(i / 4 / size);
      const col = floor(i / 4) % size;

      if ((row < 2 || row === metrics.fullAscent - 1 || col < 2) && pixmaps[0][i] !== pixmaps[2][i])
        return true;
    }
  }

  return false;
}

export function getTextWidth(items: string | string[], font: string | HTMLElement, fallbackFont?: string): number {
  const canvas = ((getTextWidth as any).canvas as HTMLCanvasElement ||
                  ((getTextWidth as any).canvas = document.createElement('canvas') as HTMLCanvasElement));
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  let maxWidth = 0;
  let elementFont;

  if (typeof font === 'string')
    elementFont = font;
  else if (typeof font === 'object')
    elementFont = getFont(font);

  /* istanbul ignore else */
  if (elementFont)
    context.font = elementFont;
  else if (fallbackFont)
    context.font = fallbackFont;
  else
    context.font = 'normal 12px sans-serif';

  if (!Array.isArray(items))
    items = [items];

  for (const item of items) {
    const width = context.measureText(item).width;
    maxWidth = max(maxWidth, width);
  }

  return maxWidth;
}

const escapeLookup: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&apos;'
};

const unescapeLookup: Record<string, string> = {};
Object.keys(escapeLookup).forEach(key => unescapeLookup[escapeLookup[key]] = key);

export function htmlEscape(s: string, escapeQuotes = false): string {
  return s.replace(escapeQuotes ? /[<>&"']/g : /[<>&]/g, m => escapeLookup[m[0]]);
}

export function htmlUnescape(s: string): string {
  s = s.replace(/&(?:#[xX]?)?[a-zA-Z0-9]+(?:;|$|(?=[^a-fA-F0-9]))/g, entity => {
    let replacement = unescapeLookup[entity];

    if (!replacement) {
      let base = 10;
      let digits: RegExpMatchArray | null | undefined;

      if (/^&#x/i.test(entity)) {
        base = 16;
        digits = /^([a-fA-F0-9]+);?/.exec(entity.substr(3));
      }
      else if (entity.startsWith('&#'))
        digits = /^([0-9]+);?/.exec(entity.substr(2));

      if (digits) {
        const n = toInt(digits[1], -1, base);

        if (0 <= n && n <= 0x10FFFF)
          replacement = String.fromCodePoint(n);
      }
    }

    return replacement ?? entity;
  });

  return s;
}

let _platform: string;
let _isMacOS_ish: boolean;
let _isMacOS: boolean;
let _isSamsung: boolean;
let _isWindows: boolean;
let _isLinux: boolean;
let _isEdge: boolean;
let _isChromium: boolean;
let _isChromiumEdge: boolean;
let _isAndroid: boolean;
let _isOpera: boolean;
let _isChrome: boolean;
let _isChromeOS: boolean;
let _isRaspbian: boolean;
let _isFirefox: boolean;
let _isSafari: boolean;
let _isIOS: boolean;
let _iosVersion: number;
let _isIOS14OrEarlier: boolean;
let _isLikelyMobile: boolean;

export function initPlatformDetection(nav: any = _navigator, win?: any, smallScreen?: boolean): void {
  win = win ?? _window;
  smallScreen = smallScreen ?? !!_window?.matchMedia('only screen and (max-width: 760px)').matches;
  _platform = nav.platform || (nav as any).userAgentData?.platform || '?';
  _isMacOS_ish = _platform.startsWith('Mac') || /\b(Mac OS X|macOS)\b/i.test(nav.userAgent);
  _isMacOS = _isMacOS_ish && !/\bmobile\b/i.test(nav.userAgent);
  _isSamsung = /\bSamsungBrowser\b|(\bAndroid\b[^)]+\bSM-)/i.test(nav.userAgent);
  _isWindows = nav.appVersion?.includes('Windows') || _platform.startsWith('Win');
  _isLinux = _platform.startsWith('Linux') || /\bLinux\b/i.test(nav.userAgent);
  _isEdge = /\bedge\b/i.test(nav.userAgent) && _isWindows;
  _isChromium = !!(win as any)?.chrome;
  _isChromiumEdge = _isChromium && _isEdge;
  _isAndroid = nav.userAgent.includes('Android') || _isSamsung;
  _isOpera = typeof win?.opr !== 'undefined' || /\bOPR\/\d+\b/.test(nav.userAgent);
  _isChrome = nav.vendor === 'Google Inc.' &&
    ((/\bChrome\b/i.test(nav.userAgent) && !_isEdge && !_isSamsung && !_isOpera && !_isChromiumEdge) ||
      /\bCriOS\b/.test(nav.userAgent));
  _isChromeOS = nav.vendor === 'Google Inc.' && /\bCrOS\b/i.test(nav.userAgent);
  _isRaspbian = nav.userAgent.includes('Raspbian') || _platform.includes('Linux armv');
  _isFirefox = /firefox/i.test(nav.userAgent) && !/seamonkey/i.test(nav.userAgent);
  _isSafari = /^((?!chrome|android).)*safari/i.test(nav.userAgent) && !_isEdge;
  _isIOS = /i(Pad|Pod|Phone)/i.test(_platform) || (_isMacOS_ish && _isSafari && nav.maxTouchPoints > 1);
  _iosVersion = toNumber((((_isIOS || null) &&
    /(((iPhone|iPad).+?OS\s+)|(Version\/))(\d+)/i.exec(nav.userAgent)) ?? [])[5]);
  _isIOS14OrEarlier = _isIOS && _iosVersion <= 14;
  _isLikelyMobile = _isIOS ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|\bmobile\b/i.test(nav.userAgent) || smallScreen;
}

initPlatformDetection();

export function isAndroid(): boolean {
  return _isAndroid;
}

export function isChrome(): boolean {
  return _isChrome;
}

export function isChromeOS(): boolean {
  return _isChromeOS;
}

export function isChromium(): boolean {
  return _isChromium;
}

export function isChromiumEdge(): boolean {
  return _isChromiumEdge;
}

export function isEdge(): boolean {
  return _isEdge;
}

export function isFirefox(): boolean {
  return _isFirefox;
}

/**
 * @deprecated will always be false as this code no longer supports IE.
 */
export function isIE(): boolean {
  // return /(?:\b(MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:)(\d+)/.test(_navigator.userAgent);
  return false;
}

export function isIOS(): boolean {
  return _isIOS;
}

export function isLinux(): boolean {
  return _isLinux;
}

export function iosVersion(): number {
  return _iosVersion;
}

export function isIOS14OrEarlier(): boolean {
  return _isIOS14OrEarlier;
}

export function isLikelyMobile(): boolean {
  return _isLikelyMobile;
}

export function isMacOS(): boolean {
  return _isMacOS;
}

export function isOpera(): boolean {
  return _isOpera;
}

/**
 * @deprecated no longer reliably detectable.
 */
export function isRaspbian(): boolean {
  return _isRaspbian;
}

export function isSafari(): boolean {
  return _isSafari;
}

export function isSamsung(): boolean {
  return _isSamsung;
}

export function isWindows(): boolean {
  return _isWindows;
}

export function restrictPixelWidth(text: string, font: string | HTMLElement, maxWidth: number, clipString = '\u2026'): string {
  let width = getTextWidth(text, font);
  let takeOffEnd = 1;

  while (width > maxWidth) {
    text = text.substring(0, text.length - takeOffEnd) + clipString;
    takeOffEnd = 1 + clipString.length;
    width = getTextWidth(text, font);
  }

  return text;
}

/* istanbul ignore next */
export function setFullScreen(full: boolean): void {
  // noinspection JSIgnoredPromiseFromCall
  setFullScreenAsync(full, true);
}

/* istanbul ignore next */
export function setFullScreenAsync(full: boolean, throwImmediate = false): Promise<void> {
  if (full !== isFullScreen())
    return toggleFullScreenAsync(throwImmediate);

  return Promise.resolve();
}

/* istanbul ignore next */
export function toggleFullScreen(): void {
  // noinspection JSIgnoredPromiseFromCall
  toggleFullScreenAsync();
}

/* istanbul ignore next */
export function toggleFullScreenAsync(throwImmediate = false): Promise<void> {
  const fsDoc = document as FsDocument;

  try {
    if (!isFullScreen()) {
      const fsDocElem = document.documentElement as FsDocumentElement;

      if (fsDocElem.requestFullscreen)
        return fsDocElem.requestFullscreen();
      else if (fsDocElem.msRequestFullscreen)
        fsDocElem.msRequestFullscreen();
      else if (fsDocElem.mozRequestFullScreen)
        fsDocElem.mozRequestFullScreen();
      else if (fsDocElem.webkitRequestFullscreen)
        fsDocElem.webkitRequestFullscreen();
    }
    else if (fsDoc.exitFullscreen)
      return fsDoc.exitFullscreen();
    else if (fsDoc.msExitFullscreen)
      fsDoc.msExitFullscreen();
    else if (fsDoc.mozCancelFullScreen)
      fsDoc.mozCancelFullScreen();
    else if (fsDoc.webkitExitFullscreen)
      fsDoc.webkitExitFullscreen();
  }
  catch (e) {
    if (throwImmediate)
      throw e;

    return Promise.reject(e);
  }

  return Promise.resolve();
}

/* istanbul ignore next */
export function isFullScreen(): boolean {
  const fsDoc = document as FsDocument;

  return !!(fsDoc.fullscreenElement || fsDoc.mozFullScreenElement || fsDoc.webkitFullscreenElement || fsDoc.msFullscreenElement);
}

/* istanbul ignore next */
export function isEffectivelyFullScreen(): boolean {
  return isFullScreen() ||
    (!!_window && _window.innerWidth === _window.screen?.width && _window.innerHeight === _window.screen?.height);
}

export function encodeForUri(s: string, spaceAsPlus = false): string {
  s = encodeURIComponent(s).replace(/[!'()*]/g, m => '%' + m.charCodeAt(0).toString(16).toUpperCase());

  return spaceAsPlus ? s.replace(/%20/g, '+') : s;
}

export function urlEncodeParams(params: Record<string, string | number | boolean | bigint | null>, spaceAsPlus = false): string {
  const result: string[] = [];

  forEach(params, (key, value) => {
    if (value != null)
      result.push(encodeForUri(key) + '=' + encodeForUri(value.toString(), spaceAsPlus));
  });

  return result.join('&');
}
