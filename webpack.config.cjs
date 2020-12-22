const { resolve } = require('path');

module.exports = env => {
  const target = env?.target === 'umd' ? 'es5' : 'es2015';
  const libraryTarget = env?.target === 'umd' ? 'umd' : 'commonjs';
  const library = env?.target === 'umd' ? 'tbUtil' : undefined;

  const config = {
    mode: env?.dev ? 'development' : 'production',
    target,
    entry: './dist/index.js',
    output: {
      path: resolve(__dirname, 'dist'),
      filename: `index.${env?.target || 'cjs'}.js`,
      libraryTarget,
      library
    },
    module: {
      rules: [
        { test: /\.js$/, use: 'babel-loader', resolve: { fullySpecified: false } }
      ]
    }
  };

  // Allow umd target to bundle @tubular/math
  if (env?.target !== 'umd')
    config.externals = ['@tubular/math'];

  return config;
};
