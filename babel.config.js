const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('babel-preserve-modules');
config.presets.push('@babel/preset-typescript');
module.exports = config;
