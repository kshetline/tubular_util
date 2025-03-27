let properties;
const originalConfig = require('./karma.conf.js');
originalConfig({ set: function (arg) { properties = arg; } });

properties.browsers = ['Chrome', 'FirefoxHeadless'];

module.exports = function (config) { config.set(properties); };
