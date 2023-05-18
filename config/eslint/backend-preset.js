const path = require('path');

module.exports = {
  extends: [
    path.resolve(__dirname, 'typescript-preset.js'),
    path.resolve(__dirname, 'jest-preset.js')
  ],
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true
  },
  rules: {
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          accessors: 'explicit',
          constructors: 'no-public',
          methods: 'explicit',
          properties: 'off',
          parameterProperties: 'explicit'
        }
      }
    ],
    '@typescript-eslint/no-empty-function': 'off'
  },
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        //
        // Regular overrides.
        //
        '@typescript-eslint/no-use-before-define': 'off'
      }
    }
  ]
};
