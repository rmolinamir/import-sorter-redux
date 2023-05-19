import path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

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
