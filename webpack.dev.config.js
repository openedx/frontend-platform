const path = require('path');
const { createConfig, getBaseConfig } = require('@edx/frontend-build');

// module.exports = createConfig('webpack-dev', {
//   entry: path.resolve(__dirname, 'example'),
//   output: {
//     path: path.resolve(__dirname, 'example/dist'),
//     publicPath: '/',
//   },
//   resolve: {
//     alias: {
//       '@edx/frontend-platform': path.resolve(__dirname, 'src'),
//     },
//   },
// });

const config = getBaseConfig('webpack-dev');

config.entry = path.resolve(__dirname, 'example');
config.output = {
  ...config.output,
  path: path.resolve(__dirname, 'example/dist'),
};
config.resolve = {
  ...config.resolve,
  alias: {
    ...config.resolve.alias,
    '@edx/frontend-platform': path.resolve(__dirname, 'src'),
  },
};

module.exports = config;
