import { floor } from '@tubular/math';
import { forEach, isNumber, toInt } from './misc-util';

export interface FontMetrics {
  font: string;
  lineHeight: number;
  ascent: number;
  fullAscent: number;
  descent: number;
  leading: number;
}

interface FsDocument extends HTMLDocument {
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

export function beep(): void {
  const audioContext = new ((window as any).AudioContext)() as AudioContext;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.value = 440;
  oscillator.connect(gain);
  gain.gain.value = 0.025;
  gain.connect(audioContext.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    oscillator.disconnect();
    gain.disconnect();
    // noinspection JSIgnoredPromiseFromCall
    audioContext.close();
  }, 100);
}

export function eventToKey(event: KeyboardEvent): string {
  let key = event.key;

  if (key === undefined) {
    // noinspection JSDeprecatedSymbols
    const charCode = event.charCode;

    if (charCode !== 0) {
      key = String.fromCodePoint(charCode);
    }
    else {
      // noinspection JSDeprecatedSymbols
      const keyCode = event.keyCode || event.which;

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
  return document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
}

export function getCssValues(element: Element, properties: string[]): string[] {
  const styles = document.defaultView.getComputedStyle(element, null);

  return properties.map(p => styles.getPropertyValue(p));
}

const fontStretches = {
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
  const style = document.defaultView.getComputedStyle(element, null);
  let font = style.getPropertyValue('font');

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

export function getFontMetrics(elementOrFont: Element | string): FontMetrics {
  let font;

  if (typeof elementOrFont === 'string')
    font = <string> elementOrFont;
  else
    font = getFont(<Element> elementOrFont);

  let metrics: FontMetrics = cachedMetrics[font];

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

  const PADDING = 50;
  const sampleText1 = 'Eg';
  const sampleText2 = 'ÅÊ';

  let lineHeight = fontSize * 1.2;
  const heightDiv = <HTMLDivElement> <any> document.createElement('div');

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

  canvas.width = testFontSize * 2 + PADDING;
  canvas.height = testFontSize * 3;
  canvas.style.opacity = '1';

  const context = canvas.getContext('2d');
  const w = canvas.width, w4 = w * 4, h = canvas.height, baseline = h / 2;

  context.fillStyle = 'white';
  context.fillRect(-1, -1, w + 2, h + 2);
  context.fillStyle = 'black';
  context.font = testFont;
  context.fillText(sampleText1, PADDING / 2, baseline);

  let pixels = context.getImageData(0, 0, w, h).data;
  let i = 0;
  const len = pixels.length;

  // Finding the ascent uses a normal, forward scanline
  while (++i < len && pixels[i] > 192) {}
  let ascent = Math.floor(i / w4);

  // Finding the descent uses a reverse scanline
  i = len - 1;
  while (--i > 0 && pixels[i] > 192) {}
  let descent = Math.floor(i / w4);

  context.fillStyle = 'white';
  context.fillRect(-1, -1, w + 2, h + 2);
  context.fillStyle = 'black';
  context.fillText(sampleText2, PADDING / 2, baseline);
  pixels = context.getImageData(0, 0, w, h).data;

  // Finding the full ascent, including diacriticals.
  i = 0;
  while (++i < len && pixels[i] > 192) {}
  let fullAscent = Math.floor(i / w4);

  ascent = baseline - ascent;
  fullAscent = baseline - fullAscent;
  descent = descent - baseline;

  if (testFontSize > fontSize) {
    ascent = Math.ceil(ascent / 2);
    fullAscent = Math.ceil(fullAscent / 2);
    descent = Math.ceil(descent / 2);
  }
  const leading = lineHeight - fullAscent - descent;

  metrics = { font: font, lineHeight: lineHeight, ascent: ascent, fullAscent: fullAscent, descent: descent, leading: leading };
  cachedMetrics[font] = metrics;

  return metrics;
}

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
  const canvas2 = self.canvas2 || (self.canvas2 = firefox && document.createElement('canvas') as HTMLCanvasElement);
  const canvases = [canvas0, canvas1, canvas2];
  const pixmaps = [];

  for (let i = 0; i < (firefox ? 3 : 2); ++i) {
    const canvas = canvases[i];

    canvas.width = size;
    canvas.height = size;
    canvas.style.opacity = '1';

    const context = canvas.getContext('2d');

    context.fillStyle = 'white';
    context.fillRect(-1, -1, size + 2, size + 2);
    context.fillStyle = 'black';
    // Compare pixels for test character to pixels for known character without a glyph.
    // For Firefox, which renders missing glyphs all differently, check if a character
    // looks the same as itself when rendered in italics -- the missing glyph boxes
    // remain straight when italicized.
    context.font = (i === 1 && firefox ? changeItalic(metrics.font) : metrics.font);
    context.fillText(i === 0 || (firefox && i !== 2) ? charOrCodePoint : '\uFFFE', 0, metrics.fullAscent);

    pixmaps[i] = context.getImageData(0, 0, size, size).data;
  }

  for (let i = 0; i < pixmaps[0].length; i += 4) {
    if (pixmaps[0][i] !== pixmaps[1][i])
      return true;
  }

  // Italic font trick doesn't always help with Firefox, so take the extra step of
  // looking for box edges.
  if (firefox) {
    for (let i = 0; i < pixmaps[0].length; i += 4) {
      const row = floor(i / 4 / size);
      const col = floor(i / 4) % size;

      if ((row === 0 || row === metrics.fullAscent - 1 || col < 2) && pixmaps[0][i] !== pixmaps[2][i])
        return true;
    }
  }

  return false;
}

export function getTextWidth(items: string | string[], font: string | HTMLElement, fallbackFont?: string): number {
  const canvas = ((getTextWidth as any).canvas as HTMLCanvasElement ||
                  ((getTextWidth as any).canvas = document.createElement('canvas') as HTMLCanvasElement));
  const context = canvas.getContext('2d');
  let maxWidth = 0;
  let elementFont;

  if (typeof font === 'string')
    elementFont = font;
  else if (typeof font === 'object')
    elementFont = getFont(font);

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
    maxWidth = Math.max(maxWidth, width);
  }

  return maxWidth;
}

const escapeLookup = {
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
      let digits: RegExpMatchArray;

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

export function isAndroid(): boolean {
  return navigator.userAgent.includes('Android');
}

export function isChrome(): boolean {
  return navigator.vendor === 'Google Inc.' &&
    ((/\bChrome\b/i.test(navigator.userAgent) && !isEdge() && !isSamsung() && !isOpera()) ||
     /\bCriOS\b/.test(navigator.userAgent));
}

export function isChromium(): boolean {
  return !!(window as any).chrome && !isIE();
}

export function isEdge(): boolean {
  return /\bedge\b/i.test(navigator.userAgent) && isWindows();
}

export function isFirefox(): boolean {
  return /firefox/i.test(navigator.userAgent) && !/seamonkey/i.test(navigator.userAgent);
}

export function isFullScreen(): boolean {
  const fsDoc = document as FsDocument;

  return !!(fsDoc.fullscreenElement || fsDoc.mozFullScreenElement || fsDoc.webkitFullscreenElement || fsDoc.msFullscreenElement);
}

export function isEffectivelyFullScreen(): boolean {
  return isFullScreen() ||
    (window.innerWidth === window.screen?.width && window.innerHeight === window.screen?.height);
}

export function isIE(): boolean {
  return /(?:\b(MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:)(\d+)/.test(navigator.userAgent);
}

export function isIOS(): boolean {
  return /i(Pad|Pod|Phone)/i.test(navigator.platform) || (isMacOS() && isSafari() && navigator.maxTouchPoints > 1);
}

export function isMacOS(): boolean {
  return navigator.platform.startsWith('Mac') || /\bMac OS X\b/i.test(navigator.userAgent);
}

export function isOpera(): boolean {
  return typeof (window as any).opr !== 'undefined';
}

export function isRaspbian(): boolean {
  return navigator.userAgent.includes('Raspbian') || navigator.userAgent.includes('Linux armv7l');
}

export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !isEdge();
}

export function isSamsung(): boolean {
  return /\bSamsungBrowser\b/i.test(navigator.userAgent);
}

export function isWindows(): boolean {
  return navigator.appVersion.includes('Windows') || navigator.platform.startsWith('Win');
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

export function setFullScreen(full: boolean): void {
  // noinspection JSIgnoredPromiseFromCall
  setFullScreenAsync(full, true);
}

export function setFullScreenAsync(full: boolean, throwImmediate = false): Promise<void> {
  if (full !== isFullScreen())
    return toggleFullScreenAsync(throwImmediate);

  return Promise.resolve();
}

export function toggleFullScreen(): void {
  // noinspection JSIgnoredPromiseFromCall
  toggleFullScreenAsync();
}

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

export function urlEncodeParams(params: { [key: string]: string | number | boolean }): string {
  const result: string[] = [];

  forEach(params, (key, value) => {
    if (value != null)
      result.push(key + '=' + encodeURIComponent(value.toString()));
  });

  return result.join('&');
}
