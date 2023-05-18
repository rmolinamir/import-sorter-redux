/// <reference types="node" />
import { Observable } from 'rxjs';
export declare function readFile$(filePath: string, encoding?: BufferEncoding): Observable<string>;
export declare function writeFile$(filePath: string, data: string): Observable<void>;
export declare function getFullPath(srcPath: string, filename: string): string;
export declare function filePaths$(startingSourcePath: string, pattern: string, ignore: string | string[]): Observable<string[]>;
//# sourceMappingURL=io.d.ts.map