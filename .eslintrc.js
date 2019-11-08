const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');

config.rules = {
  'import/no-extraneous-dependencies': ['error', {
    'devDependencies': [
      '**/*.config.js',
      '**/*.test.jsx',
      '**/*.test.js',
      'example/*',
    ],
  }],
  'import/extensions': ['error', {
    ignore: ['@edx/frontend-platform*'],
  }],
  'import/no-unresolved': ['error', {
    ignore: ['@edx/frontend-platform*'],
  }],
  'jsx-a11y/anchor-is-valid': ['error', {
    components: ['Link'],
    specialLink: [],
    specialLink: ['to'],
    aspects: ['noHref', 'invalidHref', 'preferButton'],
  }],
};

module.exports = config;
