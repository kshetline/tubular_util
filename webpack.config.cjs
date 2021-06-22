const { resolve } = require('path');

module.exports = env => {
  const dev = !!env?.dev && (/^[ty]/i.test(env?.dev) || Number(env?.dev) !== 0);
  const libraryTarget = 'umd';

  return {
    mode: dev ? 'development' : 'production',
    target: ['es6', 'web'],
    entry: './dist/index.js',
    output: {
      path: resolve(__dirname, 'dist', 'web'),
      filename: 'index.js',
      libraryTarget,
      library: 'tbUtil'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /\.spec\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', {
                targets: { // ES6 minimums
                  chrome:  '58',
                  edge:    '14',
                  firefox: '54',
                  opera:   '55',
                  safari:  '10'
                }
              }]]
            }
          },
          resolve: { fullySpecified: false }
        }
      ]
    },
    resolve: {
      mainFields: ['fesm2015', 'module', 'main']
    },
    devtool: 'source-map'
  };
};
