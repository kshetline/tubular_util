module.exports = function (config) {
  config.set({
    // logLevel: config.LOG_DEBUG,
    frameworks: ['chai', 'karma-typescript', 'mocha'],
    files: [
      'src/**/*.ts'
    ],
    preprocessors: {
      'src/**/*.ts': 'karma-typescript',
      'src/**/!(index|*spec).ts': 'coverage'
    },
    reporters: ['progress', 'karma-typescript', 'coverage'],
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.karma.json'
    },
    coverageReporter: {
      type: 'html',
      dir: './coverage-karma',
      subdir: '.'
    }
  });
};
