module.exports = {
  spec: './test/**/*.spec.ts',
  require: 'ts-node/register',
  reporter: 'spec',
  ui: 'tdd',
  timeout: 5000,
  watch: false,
  'watch-files': ['src/**/*.ts', 'test/**/*.ts'],
  'watch-ignore': ['lib/vendor']
};
