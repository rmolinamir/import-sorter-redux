import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { Observable, Observer } from 'rxjs';

export function readFile$(
  filePath: string,
  encoding: BufferEncoding = 'utf-8'
): Observable<string> {
  return new Observable((observer: Observer<string>) => {
    fs.readFile(filePath, { encoding }, (error, data) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next(data);
        observer.complete();
      }
    });
  });
}

export function writeFile$(filePath: string, data: string): Observable<void> {
  return new Observable((observer: Observer<void>) => {
    fs.writeFile(filePath, data, (error) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next(undefined);
        observer.complete();
      }
    });
  });
}

export function getFullPath(srcPath: string, filename: string): string {
  return path.join(srcPath, filename);
}

export function filePaths$(
  startingSourcePath: string,
  pattern: string,
  ignore: string | string[]
): Observable<string[]> {
  return new Observable((observer: Observer<string[]>) => {
    glob(pattern, {
      cwd: startingSourcePath,
      ignore,
      nodir: true
    })
      .then((matches) => {
        const fullPaths = matches.map((filePath) =>
          getFullPath(startingSourcePath, filePath)
        );

        observer.next(fullPaths);

        observer.complete();
      })
      .catch((error) => {
        observer.error(error);
      });
  });
}
