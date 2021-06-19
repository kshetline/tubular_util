const { resolve } = require('path');

module.exports = env => {
  const umd = !!env?.umd && (/^[ty]/i.test(env?.umd) || Number(env?.umd) !== 0);
  const cjs = !umd && !!env?.cjs && (/^[ty]/i.test(env?.cjs) || Number(env?.cjs) !== 0);
  const esVersion = umd ? 'es6' : 'es2018';
  const dir = umd ? 'web' : (cjs ? 'cjs' : 'fesm2015');
  const libraryTarget = umd ? 'umd' : (cjs ? 'commonjs' : 'module');
  const outFile = `index.${cjs ? 'c' :''}js`;
  const asModule = !umd && !cjs;

  return {
    mode: env?.dev ? 'development' : 'production',
    target: [esVersion, 'web'],
    entry: './dist/index.js',
    experiments: {
      outputModule: asModule
    },
    output: {
      path: resolve(__dirname, 'dist', dir),
      filename: outFile,
      libraryTarget,
      library: umd ? 'tbUtil' : undefined
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /\.spec\.js$/,
          use: {
            loader: 'babel-loader',
            options: { presets: [['@babel/preset-env', { targets: {
              chrome:  umd ? '58' : '64',
              edge:    umd ? '14' : '79',
              firefox: umd ? '54' : '78',
              opera:   umd ? '55' : '51',
              safari:  umd ? '10' : '12',
            } }]] }
          },
          resolve: { fullySpecified: false }
        }
      ]
    },
    resolve: {
      mainFields: ['fesm2015', 'browser', 'module', 'main']
    },
    devtool: 'source-map'
  };
};
