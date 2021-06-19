module.exports = function (config) {
  config.set({
    frameworks: ['chai', 'karma-typescript', 'mocha'],
    files: [
      'src/**/*.ts'
    ],
    preprocessors: {
      'src/**/*.ts': 'karma-typescript'
    },
    reporters: ['progress', 'karma-typescript', 'kjhtml'],
    browsers: ['Chrome'], // , 'Firefox'],
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.karma.json'
    }
  });
};
