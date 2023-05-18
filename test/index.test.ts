import * as TestRunner from 'vscode/lib/testrunner';

TestRunner.configure({
  ui: 'bdd',
  useColors: true
});

module.exports = TestRunner;
