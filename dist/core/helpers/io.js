"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filePaths$ = exports.getFullPath = exports.writeFile$ = exports.readFile$ = void 0;
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const path_1 = __importDefault(require("path"));
const rxjs_1 = require("rxjs");
function readFile$(filePath, encoding = 'utf-8') {
    return rxjs_1.Observable.create((observer) => {
        fs_1.default.readFile(filePath, { encoding }, (error, data) => {
            if (error) {
                observer.error(error);
            }
            else {
                observer.next(data);
                observer.complete();
            }
        });
    });
}
exports.readFile$ = readFile$;
function writeFile$(filePath, data) {
    return rxjs_1.Observable.create((observer) => {
        fs_1.default.writeFile(filePath, data, (error) => {
            if (error) {
                observer.error(error);
            }
            else {
                observer.next(undefined);
                observer.complete();
            }
        });
    });
}
exports.writeFile$ = writeFile$;
function getFullPath(srcPath, filename) {
    return path_1.default.join(srcPath, filename);
}
exports.getFullPath = getFullPath;
function filePaths$(startingSourcePath, pattern, ignore) {
    return rxjs_1.Observable.create((observer) => {
        (0, glob_1.default)(pattern, {
            cwd: startingSourcePath,
            ignore,
            nodir: true
        }, (error, matches) => {
            if (error) {
                observer.error(error);
            }
            else {
                const fullPaths = matches.map((filePath) => getFullPath(startingSourcePath, filePath));
                observer.next(fullPaths);
                observer.complete();
            }
        });
    });
}
exports.filePaths$ = filePaths$;
//# sourceMappingURL=io.js.map