const { resolve } = require('path');

module.exports = env => {
  return {
    mode: env?.dev ? 'development' : 'production',
    target: 'es5',
    entry: './dist/index.js',
    output: {
      path: resolve(__dirname, 'dist/web'),
      filename: `index.js`,
      libraryTarget: 'umd',
      library: 'tbUtil'
    },
    module: {
      rules: [
        { test: /\.js$/, use: 'babel-loader', resolve: { fullySpecified: false } }
      ]
    },
    resolve: {
      mainFields: ['esm2015', 'es2015', 'module', 'main', 'browser']
    },
    devtool: 'source-map'
  };
};
