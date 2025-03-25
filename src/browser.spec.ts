import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { blendColors, parseColor } from './browser-graphics-util';
import { doesCharacterGlyphExist, getCssValue, getCssValues, getFont, getFontMetrics } from './browser-util';
import { first, isArray, isArrayLike, isBoolean, last, nth } from './misc-util';
import * as util from './index';

chai.use(chaiAsPromised);
(globalThis as any).util = util;

describe('@tubular/util browser functions, for Karma testing only', () => {
  it('should parse colors correctly', () => {
    function fixAlphaRounding(color: any): any {
      color.alpha = Math.round(color.alpha * 10) / 10;
      return color;
    }

    expect(parseColor('yellow')).to.deep.equal({ r: 255, g: 255, b: 0, alpha: 1 });
    expect(parseColor('#9CF')).to.deep.equal({ r: 153, g: 204, b: 255, alpha: 1 });
    expect(parseColor('#8090a0')).to.deep.equal({ r: 128, g: 144, b: 160, alpha: 1 });
    expect(parseColor('SteelBlue')).to.deep.equal({ r: 70, g: 130, b: 180, alpha: 1 });
    expect(parseColor('transparent')).to.deep.equal({ r: 0, g: 0, b: 0, alpha: 0 });
    expect(fixAlphaRounding(parseColor('rgba(20, 30, 44, 0.5)'))).to.deep.equal({ r: 20, g: 30, b: 44, alpha: 0.5 });
  });

  it('should blend colors correctly', () => {
    let color = blendColors('white', 'black');
    expect(color).to.equal('#808080');

    color = blendColors('white', 'black', 0.75);
    expect(color).to.equal('#BFBFBF');

    color = blendColors('rgba(20, 40, 60, 0.6)', 'rgba(40, 60, 80, 0.4)');
    expect(color).to.equal('rgba(30, 50, 70, 0.5)');
  });

  it('should get fonts in correct shorthand form', () => {
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

  it('should get single and multiple css style values', () => {
    const span = document.createElement('span');

    span.style.color = 'red';
    span.style.lineHeight = '24px';
    document.body.appendChild(span);

    expect(getCssValue(span, 'color')).to.equal('rgb(255, 0, 0)');
    expect(getCssValue(span, 'line-height')).to.equal('24px');
    expect(getCssValues(span, ['color', 'line-height'])).to.eql(['rgb(255, 0, 0)', '24px']);
    document.body.removeChild(span);
  });

  it('should correctly identify missing character glyphs', () => {
    const fonts = ['12px sans-serif', '14pt monospace'];

    for (const font of fonts) {
      expect(doesCharacterGlyphExist(font, 'a')).to.be.true;
      expect(doesCharacterGlyphExist(font, '\uFFFE')).to.be.false;
      expect(doesCharacterGlyphExist(font, 0x2022)).to.be.true;
      expect(doesCharacterGlyphExist(font, 0xFFFF)).to.be.false;
    }
  });

  it('should get first, last, nth element of a DOM array', () => {
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

  it('should determine font metrics correctly', () => {
    expect(getFontMetrics('24px Arial').lineHeight).to.be.approximately(28, 1);
    expect(getFontMetrics('24px Arial', '\u1B52').extraLineHeight).to.be.approximately(35, 1);
  });
});
