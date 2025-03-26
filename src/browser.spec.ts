import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { blendColors, colorFrom24BitInt, colorFromByteArray, getPixel, parseColor, replaceAlpha, setPixel } from './browser-graphics-util';
import { doesCharacterGlyphExist, getCssValue, getCssValues, getFont, getFontMetrics } from './browser-util';
import { first, isArray, isArrayLike, isBoolean, last, nth } from './misc-util';
import * as util from './index';

chai.use(chaiAsPromised);
(globalThis as any).util = util;

describe('@tubular/util browser functions, for Karma testing only', () => {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  let context: CanvasRenderingContext2D;

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
    expect(fixAlphaRounding(parseColor('rgba(20, 30, 44, 0.5)'))).to.deep.equal({ r: 20, g: 30, b: 44, alpha: 0.5 });
    expect(fixAlphaRounding(parseColor('#1234'))).to.deep.equal({ r: 17, g: 34, b: 51, alpha: 0.27 });
    expect(fixAlphaRounding(parseColor('#56789Abc'))).to.deep.equal({ r: 86, g: 120, b: 154, alpha: 0.74 });
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

  it('colorFrom24BitInt', () => {
    expect(colorFrom24BitInt(8675309)).to.equal('#845FED');
    expect(colorFrom24BitInt(0x976543)).to.equal('#976543');
    expect(colorFrom24BitInt(0x976543, 0.5)).to.equal('rgba(151, 101, 67, 0.5)');
  });

  it('colorFromByteArray', () => {
    expect(colorFromByteArray([0x84, 0x5F, 0xED])).to.equal('#845FED');
    expect(colorFromByteArray([0x97, 0x65, 0x43, 0x80])).to.equal('rgba(151, 101, 67, 0.502)');
    expect(colorFromByteArray([0x97, 0x65, 0x43, 0x80], 1)).to.equal('#654380');
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

  it('getFontMetrics', () => {
    expect(getFontMetrics('24px Arial').lineHeight).to.be.approximately(28, 1);
    expect(getFontMetrics('24px Arial', '\u1B52').extraLineHeight).to.be.approximately(35, 1);
  });

  it('getPixel/setPixel', () => {
    prepareCanvas();

    let imageData = context.getImageData(0, 0, 100, 100);

    expect(getPixel(imageData, 0, 0)).to.equal(0xFFFFFFFF | 0);
    expect(getPixel(imageData, 200, 50)).to.equal(0);
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
});
