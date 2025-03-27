import chai, { expect } from 'chai';
import spies from 'chai-spies';
import chaiAsPromised from 'chai-as-promised';
import {
  blendColors, colorFrom24BitInt, colorFromByteArray, colorFromRGB, drawOutlinedText, fillCircle, fillEllipse, getPixel, parseColor,
  replaceAlpha, setPixel, strokeCircle, strokeEllipse, strokeLine
} from './browser-graphics-util';
/* @ts-ignore */ // noinspection JSDeprecatedSymbols
import browserUtil, {
  beep, beepPromise, doesCharacterGlyphExist, eventToKey, getCssRuleValue, getCssRuleValues, getCssValue, getCssValues,
  getCssVariable, getFont, getFontMetrics, initPlatformDetection, iosVersion, isAndroid, isChrome, isChromeOS,
  isChromium, isChromiumEdge, isEdge, isEffectivelyFullScreen, isFirefox, isIE, isIOS, isIOS14OrEarlier,
  isLikelyMobile, isLinux, isMacOS, isOpera, isRaspbian, isSafari, isSamsung, isWindows, restrictPixelWidth,
  setCssVariable, setFullScreen, toggleFullScreen
} from './browser-util';
import { first, isArray, isArrayLike, isBoolean, last, nth, processMillis } from './misc-util';
import * as util from './index';
import compareImages from 'resemblejs/compareImages';
import Resemble from 'resemblejs';

chai.use(spies);
chai.use(chaiAsPromised);
(globalThis as any).util = util;

/* cspell:disable-next-line */ // noinspection SpellCheckingInspection
const outlinedHello = 'data:image/png;base64,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';
/* cspell:disable-next-line */ // noinspection SpellCheckingInspection
const noOutlineHello = 'data:image/png;base64,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';
/* cspell:disable-next-line */ // noinspection SpellCheckingInspection
const filledShapes = 'data:image/png;base64,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';
/* cspell:disable-next-line */ // noinspection SpellCheckingInspection
const strokes = 'data:image/png;base64,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';

describe('@tubular/util browser functions, for Karma testing only', () => {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  const compOptions: Resemble.ComparisonOptions = { ignore: 'antialiasing' };
  const matchTolerance = isFirefox() ? 1 : 0.5;

  function prepareCanvas(alpha?: number): void {
    canvas.width = 100;
    canvas.height = 100;
    canvas.style.opacity = '1';
    context = canvas.getContext('2d')!;

    if (alpha != null)
      context.globalAlpha = alpha;

    context.fillStyle = 'white';
    context.fillRect(-1, -1, 102, 102);
    context.globalAlpha = 1;
    context.fillStyle = 'black';
  }

  async function createImage(src: string): Promise<HTMLImageElement> {
    const img = document.createElement('img') as HTMLImageElement;

    img.src = src;
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = err => reject(err);
    });
  }

  afterEach(() => initPlatformDetection());

  it('should parse colors correctly', () => {
    function fixAlphaRounding(color: any): any {
      color.alpha = Math.round(color.alpha * 100) / 100;
      return color;
    }

    expect(parseColor('yellow')).to.deep.equal({ r: 255, g: 255, b: 0, alpha: 1 });
    expect(parseColor('#9CF')).to.deep.equal({ r: 153, g: 204, b: 255, alpha: 1 });
    expect(parseColor('#8090a0')).to.deep.equal({ r: 128, g: 144, b: 160, alpha: 1 });
    expect(parseColor('SteelBlue')).to.deep.equal({ r: 70, g: 130, b: 180, alpha: 1 });
    expect(parseColor('transparent')).to.deep.equal({ r: 0, g: 0, b: 0, alpha: 0 });
    expect(parseColor('rgb(20, 30, 44)')).to.deep.equal({ r: 20, g: 30, b: 44, alpha: 1 });
    expect(fixAlphaRounding(parseColor('rgba(20, 30, 44, 0.5)'))).to.deep.equal({ r: 20, g: 30, b: 44, alpha: 0.5 });
    expect(fixAlphaRounding(parseColor('#1234'))).to.deep.equal({ r: 17, g: 34, b: 51, alpha: 0.27 });
    expect(fixAlphaRounding(parseColor('#56789Abc'))).to.deep.equal({ r: 86, g: 120, b: 154, alpha: 0.74 });
    expect(parseColor('not a real color')).to.deep.equal({ r: 0, g: 0, b: 0, alpha: 0 });
  });

  it('blendColors', () => {
    let color = blendColors('white', 'black');
    expect(color).to.equal('#808080');

    color = blendColors('white', 'black', 0.75);
    expect(color).to.equal('#BFBFBF');

    color = blendColors('rgba(20, 40, 60, 0.6)', 'rgba(40, 60, 80, 0.4)');
    expect(color).to.equal('rgba(30, 50, 70, 0.5)');
  });

  it('replaceAlpha', () => {
    let color = replaceAlpha('yellow', 0.25);
    expect(color).to.equal('rgba(255, 255, 0, 0.25)');

    color = replaceAlpha('#55667788', 0.667);
    expect(color).to.equal('rgba(85, 102, 119, 0.667)');
  });

  it('colorFromRGB', () => {
    expect(colorFromRGB(1, 2, 3)).to.equal('#010203');
    expect(colorFromRGB(1, 2, 3, 0.5)).to.equal('rgba(1, 2, 3, 0.5)');
  });

  it('colorFrom24BitInt', () => {
    expect(colorFrom24BitInt(8675309)).to.equal('#845FED');
    expect(colorFrom24BitInt(0x976543)).to.equal('#976543');
    expect(colorFrom24BitInt(0x976543, 0.5)).to.equal('rgba(151, 101, 67, 0.5)');
  });

  it('colorFromByteArray', () => {
    expect(colorFromByteArray([])).to.equal('#000000');
    expect(colorFromByteArray([0x84, 0x5F, 0xED])).to.equal('#845FED');
    expect(colorFromByteArray([0x97, 0x65, 0x43, 0x80])).to.equal('rgba(151, 101, 67, 0.502)');
    expect(colorFromByteArray([0x97, 0x65, 0x43, 0x80], 1)).to.equal('#654380');
  });

  it('eventToKey', () => {
    expect(eventToKey({ keyCode: 3 } as any)).to.equal('Enter');
    expect(eventToKey({ keyCode: 48 } as any)).to.equal('0');
    expect(eventToKey({ keyCode: 99 } as any)).to.equal('3');
    expect(eventToKey({ keyCode: 113 } as any)).to.equal('F2');
    expect(eventToKey({ keyCode: 144 } as any)).to.equal('NumLock');
    expect(eventToKey({ keyCode: 224 } as any)).to.equal('Meta');
    expect(eventToKey({ charCode: 65 } as any)).to.equal('A');
    expect(eventToKey({ key: 'PageUp' } as any)).to.equal('PageUp');
    expect(eventToKey({ key: 'UIKeyInputLeftArrow' } as any)).to.equal('ArrowLeft');
    expect(eventToKey({ key: 'Multiply' } as any)).to.equal('*');
    expect(eventToKey({ key: 'Win' } as any)).to.equal('Meta');
  });

  it('beep/beepPromise', async () => {
    const spy = chai.spy.on(browserUtil, 'beepPromise');
    // There's no good way to actually check that sound, and the right sound, happens. Settle for checking duration.
    const start = processMillis();

    await beepPromise();
    const delay = processMillis() - start;
    expect(delay).to.be.greaterThan(90);
    expect(delay).to.be.lessThan(300);
    expect(spy).to.have.been.called;

    const spy2 = chai.spy.on(window.AudioContext, 'createGain');

    beep();
    await util.sleep(10);
    expect(spy2).to.have.been.called;
  });

  it('getFont, correct shorthand form', () => {
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

  it('getCssValue, getCssValues', () => {
    const span = document.createElement('span');

    span.style.color = 'red';
    span.style.lineHeight = '24px';
    document.body.appendChild(span);

    expect(getCssValue(span, 'color')).to.equal('rgb(255, 0, 0)');
    expect(getCssValue(span, 'line-height')).to.equal('24px');
    expect(getCssValues(span, ['color', 'line-height'])).to.eql(['rgb(255, 0, 0)', '24px']);
    document.body.removeChild(span);
  });

  it('getCssVariable, setCssVariable', () => {
    setCssVariable('--foo', 'bar');
    expect(getCssVariable('--foo')).to.equal('bar');
  });

  it('getCssRuleValue', () => {
    document.head.innerHTML = document.head.innerHTML + `
<style>
  body {
    background-color: magenta;
    font-family: sans-serif;
    padding: 4px;
  }

  @supports (display: block) {
    body {
      color: blue;
    }
  }

  @media screen and (max-width: 50000px) {
    body {
      margin: 1px 2px;
    }
  }
</style>`;
    expect(getCssRuleValue(document.body, 'font-family')).to.equal('sans-serif');
    expect(getCssRuleValues(document.body, ['background-color', 'color', 'padding', 'margin']))
      .to.deep.equal(['magenta', 'blue', '4px', '1px 2px']);
  });

  it('doesCharacterGlyphExist', () => {
    const fonts = ['12px sans-serif', '14pt monospace'];

    for (const font of fonts) {
      expect(doesCharacterGlyphExist(font, 'a')).to.be.true;
      expect(doesCharacterGlyphExist(font, '\uFFFE')).to.be.false;
      expect(doesCharacterGlyphExist(font, 0x2022)).to.be.true;
      expect(doesCharacterGlyphExist(font, 0xFFFF)).to.be.false;
    }
  });

  it('first, last, nth element of a DOM array', () => {
    const elem = document.createElement('div');
    elem.appendChild(document.createElement('p'));
    elem.appendChild(document.createElement('span'));
    elem.appendChild(document.createElement('script'));

    expect(last(null)).to.equal(undefined);
    expect(first(elem.children)!.outerHTML).to.equal('<p></p>');
    expect(last(elem.children)!.outerHTML).to.equal('<script></script>');
    expect(nth(elem.children, 1)!.outerHTML).to.equal('<span></span>');
  });

  it('should properly recognize DOM data types', () => {
    expect(isArray(5)).to.be.false;
    expect(isArray('foo')).to.be.false;

    const elem = document.createElement('div');

    elem.appendChild(document.createElement('p'));
    expect(isArray(elem.childNodes)).to.be.false;
    expect(isArrayLike(elem.childNodes)).to.be.true;
    expect(isBoolean(elem.childNodes)).to.be.false;
  });

  it('restrictPixelWidth', () => {
    expect(restrictPixelWidth('Now is the time', '12px Times New Roman, serif', 50)).to.equal('Now is …');
    expect(restrictPixelWidth('Now is the time', '12px Times New Roman, serif', 50, '...')).to.equal('Now is t...');
    expect(restrictPixelWidth('Now is the time', '12px Courier New, monospace', 75)).to.equal('Now is th…');
    expect(restrictPixelWidth('Now is the time', '9px Arial, sans-serif', 250)).to.equal('Now is the time');
  });

  it('getFontMetrics', () => {
    expect(getFontMetrics('24px Arial').lineHeight).to.be.approximately(28, 1);
    expect(getFontMetrics('24px Arial', '\u1B52').extraLineHeight).to.be.approximately(35, 1);
  });

  it('getPixel/setPixel', () => {
    prepareCanvas();

    let imageData = context.getImageData(0, 0, 100, 100);

    expect(getPixel(imageData, 0, 0)).to.equal(0xFFFFFFFF | 0);
    expect(getPixel(imageData, 200, 50)).to.equal(0);
    setPixel(imageData, -50, -50, 0);
    setPixel(imageData, 50, 50, 0xFFDCBA98 | 0);
    expect(getPixel(imageData, 50, 50)).to.equal(0xFFDCBA98 | 0);

    context.fillStyle = 'red';
    context.fillRect(0, 0, 30, 70);
    imageData = context.getImageData(0, 0, 100, 100);
    expect(getPixel(imageData, 32, 5)).to.equal(0xFFFFFFFF | 0);
    expect(getPixel(imageData, 28, 5)).to.equal(0xFFFF0000 | 0);
    expect(getPixel(imageData, 12, 77)).to.equal(0xFFFFFFFF | 0);
    expect(getPixel(imageData, 20, 69)).to.equal(0xFFFF0000 | 0);

    prepareCanvas(0.251);
    imageData = context.getImageData(0, 0, 100, 100);
    expect(getPixel(imageData, 0, 0)).to.equal(0x40FFFFFF);
  });

  it('drawOutlinedText', async () => {
    let img = await createImage(outlinedHello);

    prepareCanvas();
    context.font = '28pt Arial';
    drawOutlinedText(context, 'Hello', 5, 50, 'red', 'blue', 2);

    let comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);

    expect(comparison.rawMisMatchPercentage).to.be.lessThan(matchTolerance);

    prepareCanvas();
    context.font = '28pt Arial';
    drawOutlinedText(context, 'Hello', 5, 50, 'red', 'blue');

    comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);
    expect(comparison.rawMisMatchPercentage).to.be.greaterThan(matchTolerance);

    prepareCanvas();
    context.font = '28pt Arial';
    drawOutlinedText(context, 'Hello', 5, 50, 'red', 'blue', 0);

    comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);
    expect(comparison.rawMisMatchPercentage).to.be.greaterThan(matchTolerance);

    img = await createImage(noOutlineHello);

    comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);
    expect(comparison.rawMisMatchPercentage).to.be.lessThan(matchTolerance);
  });

  it('fillCircle/fillEllipse', async () => {
    const img = await createImage(filledShapes);

    prepareCanvas();

    let comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);

    expect(comparison.rawMisMatchPercentage).to.be.greaterThan(matchTolerance);

    context.fillStyle = 'orange';
    fillCircle(context, 50, 50, 30);
    context.fillStyle = 'blue';
    fillEllipse(context, 70, 30, 15, 25);
    comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);
    expect(comparison.rawMisMatchPercentage).to.be.lessThan(matchTolerance);
  });

  it('strokeCircle/strokeEllipse/strokeLine', async () => {
    const img = await createImage(strokes);

    prepareCanvas();

    let comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);

    expect(comparison.rawMisMatchPercentage).to.be.greaterThan(matchTolerance);

    context.lineWidth = 2;
    context.strokeStyle = 'orange';
    strokeCircle(context, 50, 50, 30);
    context.strokeStyle = 'blue';
    strokeEllipse(context, 70, 30, 15, 25);
    context.strokeStyle = 'magenta';
    context.lineWidth = 4;
    strokeLine(context, 10, 10, 90, 80);
    comparison = await compareImages(img.src, context.getImageData(0, 0, 100, 100), compOptions);
    expect(comparison.rawMisMatchPercentage).to.be.lessThan(matchTolerance);
  });

  it('platform checking, Android', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36,gzip(gfe)' },
      { chrome: {} });
    expect(isAndroid()).to.be.true;
    expect(isChromeOS()).to.be.false;
    expect(isChromium()).to.be.true;
    // noinspection JSDeprecatedSymbols
    expect(isIE()).to.be.false;
  });

  it('platform checking, Samsung', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36' });
    expect(isSamsung()).to.be.true;
    expect(isWindows()).to.be.false;
    expect(isIE()).to.be.false;
  });

  it('platform checking, Edge', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246', platform: 'Win32' },
      { chrome: {} });
    expect(isWindows()).to.be.true;
    expect(isEdge()).to.be.true;
    expect(isChromium()).to.be.true;
    expect(isChromiumEdge()).to.be.true;
    expect(isSafari()).to.be.false;
    expect(isIE()).to.be.false;
  });

  it('platform checking, Safari/macOS', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15', platform: 'MacIntel' });
    expect(isSafari()).to.be.true;
    expect(isMacOS()).to.be.true;
    expect(isIOS()).to.be.false;
    expect(isChromeOS()).to.be.false;
    expect(isRaspbian()).to.be.false;
  });

  it('platform checking, Chrome/Windows', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', platform: 'Win32', vendor: 'Google Inc.' });
    expect(isChrome()).to.be.true;
    expect(isWindows()).to.be.true;
    expect(isIOS()).to.be.false;
    expect(isChromeOS()).to.be.false;
    expect(isEdge()).to.be.false;
    expect(isFirefox()).to.be.false;
    expect(isLikelyMobile()).to.be.false;
  });

  it('platform checking, Firefox/Linux', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0', platform: 'Linux armv7l' });
    expect(isFirefox()).to.be.true;
    expect(isLinux()).to.be.true;
    // noinspection JSDeprecatedSymbols
    expect(isRaspbian()).to.be.true;
    expect(isChromeOS()).to.be.false;
    expect(isOpera()).to.be.false;
  });

  it('platform checking, Safari/iOS', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Mobile/15E148 Safari/604.1', platform: 'iPhone' }, undefined, true);
    expect(isSafari()).to.be.true;
    expect(isIOS()).to.be.true;
    expect(iosVersion()).to.equal(18);
    expect(isLikelyMobile()).to.be.true;
    expect(isIOS14OrEarlier()).to.be.false;
    expect(isOpera()).to.be.false;
  });

  it('platform checking, Opera/Samsung', () => {
    initPlatformDetection({ userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36 OPR/76.2.4027.73374' });
    expect(isOpera()).to.be.true;
    expect(isLinux()).to.be.true;
    expect(isAndroid()).to.be.true;
  });

  it('misc fairly untestable', () => {
    expect(setFullScreen).to.be.ok;
    expect(toggleFullScreen).to.be.ok;
    expect(isEffectivelyFullScreen).to.be.ok;
  });
});
