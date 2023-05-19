import { glob } from 'glob';
import Mocha from 'mocha';
import path from 'path';

export async function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  const files = await glob('**/**.spec.js', { cwd: testsRoot });

  await new Promise((resolve, reject) => {
    files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve(undefined);
      }
    });
  });
}
