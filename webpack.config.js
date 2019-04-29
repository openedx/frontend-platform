'use strict';

const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'frontend-auth',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/camelcase-keys'),
          path.resolve(__dirname, 'node_modules/camelcase'),
          path.resolve(__dirname, 'node_modules/map-obj'),
          path.resolve(__dirname, 'node_modules/quick-lru'),
        ],
        use: [
          { loader: 'babel-loader' },
          { loader: 'source-map-loader' },
        ],
      },
    ],
  },
};
