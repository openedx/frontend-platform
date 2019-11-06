const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');

config.rules = {
  "import/no-extraneous-dependencies": [
    "error",
    {
      "devDependencies": [
        "**/*.config.js",
        "**/*.test.jsx",
        "**/*.test.js",
        "example/*",
      ],
    },
  ],
};

module.exports = config;
