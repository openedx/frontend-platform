const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('webpack-dev', {
  entry: {
    app: path.resolve(__dirname, 'example'),
  },
  output: {
    path: path.resolve(__dirname, 'example/dist'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      '@edx/frontend-platform': path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'example/dist'),
    },
  },
});
