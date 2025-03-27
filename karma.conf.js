module.exports = function (config) {
  config.set({
    // logLevel: config.LOG_DEBUG,
    frameworks: ['chai', 'karma-typescript', 'mocha'],
    files: [
      'src/**/*.ts'
    ],
    preprocessors: {
      'src/**/*.ts': 'karma-typescript'
    },
    reporters: ['progress', 'karma-typescript'],
    browsers: ['Chrome', 'FirefoxHeadless'],
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.karma.json'
    },
  });
};
