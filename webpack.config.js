'use strict';

const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    nodeEnv: false,
  },
  node: {
    process: false,
  },
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'frontend-i18n',
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
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React',
    },
    '@edx/frontend-logging': {
      commonjs: '@edx/frontend-logging',
      commonjs2: '@edx/frontend-logging',
      amd: '@edx/frontend-logging',
      root: '@edx/frontend-logging',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          { loader: 'babel-loader' },
          { loader: 'source-map-loader' },
        ],
      },
    ],
  },
};
