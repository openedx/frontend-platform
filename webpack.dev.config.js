const path = require('path');
const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('webpack-dev', {
  entry: path.resolve(__dirname, 'example'),
  output: {
    path: path.resolve(__dirname, 'example/dist'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      '@edx/frontend-platform': path.resolve(__dirname, 'src'),
      '@edx/frontend-platform/base': path.resolve(__dirname, 'src/base'),
      '@edx/frontend-platform/logging': path.resolve(__dirname, 'src/logging'),
      '@edx/frontend-platform/i18n': path.resolve(__dirname, 'src/i18n'),
      '@edx/frontend-i18n': path.resolve(__dirname, 'src/i18n'),
      '@edx/frontend-logging': path.resolve(__dirname, 'src/logging'),
      '@edx/frontend-analytics': path.resolve(__dirname, 'src/analytics'),
      '@edx/frontend-auth': path.resolve(__dirname, 'src/auth'),
    },
  },
});
