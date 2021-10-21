const path = require('path');
const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('webpack-dev', {
  resolve: {
    alias: {
      '@edx/frontend-platform': path.resolve(__dirname, '..', 'src'),
      // Note: these three aliases are a manual version of what module.config.js solves in our
      // applications.  Because this example app is using code from the parent frontend-platform
      // library, it runs into the same issues our applications do when loading libraries from
      // local source, rather than from their node_modules directory.
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules', 'react-router-dom'),
    },
  },
});
