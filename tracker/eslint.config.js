const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
      },
    },
  },
];
