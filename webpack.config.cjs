const { resolve } = require('path');

module.exports = env => {
  const esVersion = env?.esver === '5' ? 'es5' : 'es6';
  const dir = env?.esver === '5' ? 'web5' : 'web';
  const chromeVersion = env?.esver === '5' ? '23' : '51';

  return {
    mode: env?.dev ? 'development' : 'production',
    target: [esVersion, 'web'],
    entry: './dist/index.js',
    output: {
      path: resolve(__dirname, 'dist/' + dir),
      filename: `index.js`,
      libraryTarget: 'umd',
      library: 'tbUtil'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: { presets: [['@babel/preset-env', { targets: { chrome: chromeVersion } }]] }
          },
          resolve: { fullySpecified: false }
        }
      ]
    },
    resolve: {
      mainFields: ['es2015', 'browser', 'module', 'main', 'main-es5']
    },
    devtool: 'source-map'
  };
};
