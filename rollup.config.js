const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

module.exports = [
  {
    input: 'src/index.ts',
    output: [{
      file: pkg['umd:main'],
      sourcemap: true,
      format: 'umd',
      name: 'tbUtil'
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
    terser({ format: { max_line_len: 511 }}),
    typescript()
  ]
}];
