import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

// noinspection JSUnusedGlobalSymbols
export default [
  {
    input: 'dist/index.js',
    output: [
      {
        file: pkg['umd:main'],
        sourcemap: true,
        format: 'umd',
        name: 'JSONZ'
      },
      {
        file: pkg.main,
        sourcemap: true,
        format: 'cjs'
      },
      {
        file: pkg.module,
        sourcemap: true,
        format: 'esm'
      }
    ],
    plugins: [
      sourcemaps(),
      terser({ output: { max_line_len: 511 } }),
      typescript({ sourceMap: true, inlineSources: true })
    ]
  }
];
