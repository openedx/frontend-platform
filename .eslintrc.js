const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@openedx/frontend-build');

const config = getBaseConfig('eslint');

config.settings = {
  'import/resolver': {
    webpack: {
      config: path.resolve(__dirname, 'webpack.dev.config.js'),
    },
    alias: {
      map: [
        ['@communications-app', '.'],
      ],
      extensions: ['.ts', '.js', '.jsx', '.json'],
    },
  },
};
config.rules = {
  'import/no-extraneous-dependencies': ['error', {
    devDependencies: [
      '**/*.config.js',
      '**/*.test.jsx',
      '**/*.test.js',
      'example/*',
    ],
  }],
  'import/prefer-default-export': 'off',
  'import/extensions': ['error', {
    ignore: ['@edx/frontend-platform*', '@openedx/frontend-build*'],
  }],
  'import/no-unresolved': ['error', {
    ignore: ['@edx/frontend-platform*', '@openedx/frontend-build*'],
  }],
  'jsx-a11y/anchor-is-valid': ['error', {
    components: ['Link'],
    specialLink: ['to'],
    aspects: ['noHref', 'invalidHref', 'preferButton'],
  }],
};

config.overrides = [
  {
    files: ['plugins/**/*.jsx'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
];

module.exports = config;
