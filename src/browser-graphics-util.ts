/*
  Copyright © 2017-2020 Kerry Shetline, kerry@shetline.com

  MIT license: https://opensource.org/licenses/MIT

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
  documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
  persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
  Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { max, min, round } from '@tubular/math';
import { padLeft } from './string-util';

export interface RGBA {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

const colorNameRegex = /[a-z]+/i;
const rgbaRegex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/;
const rgbRegex  = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;

let utilContext: CanvasRenderingContext2D;

export function blendColors(color1: string, color2: string, portion1 = 0.5): string {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  const r1 = c1.r;
  const g1 = c1.g;
  const b1 = c1.b;
  const a1 = c1.alpha;
  const r2 = c2.r;
  const g2 = c2.g;
  const b2 = c2.b;
  const a2 = c2.alpha;
  const portion2 = 1 - portion1;

  return colorFromRGB(r1 * portion1 + r2 * portion2,
                      g1 * portion1 + g2 * portion2,
                      b1 * portion1 + b2 * portion2,
                      a1 * portion1 + a2 * portion2);
}

export function colorFrom24BitInt(i: number, alpha = 1.0): string {
  const r = (i & 0xFF0000) >> 16;
  const g = (i & 0x00FF00) >> 8;
  const b =  i & 0x0000FF;

  return colorFromRGB(r, g, b, alpha);
}

export function colorFromByteArray(array: number[], offset: number): string {
  const r = array[offset];
  const g = array[offset + 1];
  const b = array[offset + 2];
  const alpha = array[offset + 4] / 255;

  return colorFromRGB(r, g, b, alpha);
}

export function colorFromRGB(r: number, g: number, b: number, alpha = 1.0): string {
  r = min(max(round(r), 0), 255);
  g = min(max(round(g), 0), 255);
  b = min(max(round(b), 0), 255);
  const a = min(max(alpha, 0), 1).toFixed(4).replace(/([01]).0000/, '$1').replace(/([^0])0+$/, '$1');

  if (a === '1')
    return ('#' + padLeft(r.toString(16), 2, '0')
                + padLeft(g.toString(16), 2, '0')
                + padLeft(b.toString(16), 2, '0')).toUpperCase();
  else
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function drawOutlinedText(context: CanvasRenderingContext2D, text: string, x: number, y: number,
                                 outlineStyle?: string, fillStyle?: string): void {
  context.save();
  context.lineWidth = 4;
  context.lineJoin = 'round';

  if (outlineStyle)
    context.strokeStyle = outlineStyle;

  if (fillStyle)
    context.fillStyle = fillStyle;

  context.strokeText(text, x, y);
  context.fillText(text, x, y);
  context.restore();
}

export function fillEllipse(context: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void {
  context.save();
  context.beginPath();

  context.translate(cx - rx, cy - ry);
  context.scale(rx, ry);
  context.arc(1, 1, 1, 0, Math.PI * 2, false);

  context.restore();
  context.fill();
}

export function getPixel(imageData: ImageData, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height)
    return 0;

  const offset = (y * imageData.width + x) * 4;

  // eslint-disable-next-line computed-property-spacing
  return (imageData.data[offset    ] << 16) |
         (imageData.data[offset + 1] <<  8) |
          imageData.data[offset + 2]        |
         (imageData.data[offset + 3] << 24);
}

export function parseColor(color: string): RGBA {
  let match = colorNameRegex.exec(color);

  if (match) {
    if (!utilContext) {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      utilContext = canvas.getContext('2d');
    }

    utilContext.fillStyle = color; // Let the context parse the color name.
    color = String(utilContext.fillStyle); // Get the same color back in hex/RGB form.
  }

  if (color.startsWith('#')) {
    if (color.length === 4)
      return {
        r: parseInt(color.substr(1, 1) + color.substr(1, 1), 16),
        g: parseInt(color.substr(2, 1) + color.substr(2, 1), 16),
        b: parseInt(color.substr(3, 1) + color.substr(3, 1), 16),
        alpha: 1.0
      };
    else if (color.length === 7)
      return {
        r: parseInt(color.substr(1, 2), 16),
        g: parseInt(color.substr(3, 2), 16),
        b: parseInt(color.substr(5, 2), 16),
        alpha: 1.0
      };
  }

  match = rgbRegex.exec(color);

  if (match)
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), alpha: 1 };

  match = rgbaRegex.exec(color);

  if (match)
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), alpha: Number(match[4]) };

  return { r: 0, g: 0, b: 0, alpha: 0 };
}

export function replaceAlpha(color: string, newAlpha: number): string {
  const rgba = parseColor(color);

  return colorFromRGB(rgba.r, rgba.g, rgba.b, newAlpha);
}

export function setPixel(imageData: ImageData, x: number, y: number, pixel: number): void {
  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height)
    return;

  const offset = (y * imageData.width + x) * 4;

  // eslint-disable-next-line computed-property-spacing
  imageData.data[offset    ] =  (pixel & 0x00FF0000) >> 16;
  imageData.data[offset + 1] =  (pixel & 0x0000FF00) >>  8;
  imageData.data[offset + 2] =   pixel & 0x000000FF;
  imageData.data[offset + 3] = ((pixel & 0xFF000000) >> 24) & 0xFF;
}

export function strokeCircle(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2, false);
  context.stroke();
  context.closePath();
}

export function strokeEllipse(context: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void {
  context.save();
  context.beginPath();

  context.translate(cx - rx, cy - ry);
  context.scale(rx, ry);
  context.arc(1, 1, 1, 0, Math.PI * 2, false);

  context.restore();
  context.stroke();
  context.closePath();
}

export function strokeLine(context: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.stroke();
  context.closePath();
}
