import { runTests } from '@vscode/test-electron';
import path from 'path';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../');
    const extensionTestsPath = path.resolve(__dirname, './runner.js');

    // Download VS Code, unzip it and run the integration test:
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error(err);
    console.error('Failed to run tests!');
    process.exit(1);
  }
}

main();
