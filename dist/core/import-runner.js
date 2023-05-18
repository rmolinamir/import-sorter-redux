"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleImportRunner = void 0;
const lodash_1 = require("lodash");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const helpers_public_1 = require("./helpers/helpers-public");
const models_public_1 = require("./models/models-public");
class SimpleImportRunner {
    constructor(parser, sorter, importCreator, configurationProvider) {
        this.parser = parser;
        this.sorter = sorter;
        this.importCreator = importCreator;
        this.configurationProvider = configurationProvider;
    }
    getSortImportData(filePath, fileSource) {
        this.resetConfiguration();
        return this.getSortedData(filePath, fileSource);
    }
    sortImportsInDirectory(directoryPath) {
        this.resetConfiguration();
        return this.sortAllImports$(directoryPath);
    }
    resetConfiguration() {
        const configuration = this.configurationProvider.getConfiguration();
        this.sorter.initialize(configuration.sortConfiguration);
        this.importCreator.initialize(configuration.importStringConfiguration);
    }
    getSortedData(filePath, fileSource) {
        const isFileExcluded = this.isFileExcludedFromSorting(filePath);
        if (isFileExcluded)
            return {
                isSortRequired: false,
                sortedImportsText: null,
                rangesToDelete: null,
                firstLineNumberToInsertText: null
            };
        const imports = this.parser.parseImports(filePath, fileSource);
        if (!imports.importElements.length)
            return {
                isSortRequired: false,
                sortedImportsText: null,
                rangesToDelete: null,
                firstLineNumberToInsertText: null
            };
        const sortedImports = this.sorter.sortImportElements(imports.importElements);
        const sortedImportsWithExcludedImports = this.getExcludeUnusedImports(sortedImports, imports.usedTypeReferences);
        const sortedImportsText = this.importCreator.createImportText(sortedImportsWithExcludedImports.groups);
        // normalize imports by skipping lines which should not be touched
        const fileSourceWithSkippedLineShiftArray = fileSource
            .split('\n')
            .slice(imports.firstImportLineNumber);
        const fileSourceWithSkippedLineShift = fileSourceWithSkippedLineShiftArray.join('\n');
        const fileSourceArray = fileSource.split('\n');
        const importTextArray = sortedImportsText.split('\n');
        const isSorted = this.isSourceAlreadySorted({ data: importTextArray, text: sortedImportsText }, {
            data: fileSourceWithSkippedLineShiftArray,
            text: fileSourceWithSkippedLineShift
        });
        if (isSorted)
            return {
                isSortRequired: false,
                sortedImportsText,
                rangesToDelete: null,
                firstLineNumberToInsertText: imports.firstImportLineNumber
            };
        const rangesToDelete = this.getRangesToDelete(sortedImportsWithExcludedImports, fileSourceArray, fileSource);
        return {
            isSortRequired: true,
            sortedImportsText,
            rangesToDelete,
            firstLineNumberToInsertText: imports.firstImportLineNumber
        };
    }
    getExcludeUnusedImports(sortResult, usedTypeReferences) {
        const isRemoveUnusedImports = this.configurationProvider.getConfiguration().sortConfiguration
            .removeUnusedImports;
        if (!isRemoveUnusedImports)
            return {
                groups: sortResult.groups,
                toRemove: sortResult.duplicates
            };
        const isRemoveUnusedDefaultImports = this.configurationProvider.getConfiguration().sortConfiguration
            .removeUnusedDefaultImports;
        const sortResultClonned = (0, lodash_1.cloneDeep)(sortResult);
        const unusedImportElements = [];
        sortResultClonned.groups.forEach((gr) => {
            gr.elements = gr.elements.filter((el) => {
                var _a, _b;
                // side effect import
                if (!el.hasFromKeyWord)
                    return true;
                // filtering name bindings
                el.namedBindings = (_a = el.namedBindings) === null || _a === void 0 ? void 0 : _a.filter((nameBinding) => {
                    const isUnusedNameBinding = !usedTypeReferences.some((reference) => reference === (nameBinding.aliasName || nameBinding.name));
                    return !isUnusedNameBinding;
                });
                if (!isRemoveUnusedDefaultImports && el.defaultImportName)
                    return true;
                if (isRemoveUnusedDefaultImports &&
                    usedTypeReferences.some((reference) => reference === el.defaultImportName))
                    return true;
                // if not default import and not side effect, then check name bindings
                if (!((_b = el.namedBindings) === null || _b === void 0 ? void 0 : _b.length)) {
                    unusedImportElements.push(el);
                    return false;
                }
                return true;
            });
            return !gr.elements.length;
        });
        return {
            groups: sortResultClonned.groups,
            toRemove: [...unusedImportElements, ...sortResultClonned.duplicates]
        };
    }
    sortAllImports$(startingSourcePath) {
        const allFilePaths$ = this.allFilePathsUnderThePath$(startingSourcePath);
        return allFilePaths$.pipe((0, operators_1.mergeAll)(), (0, operators_1.flatMap)((path) => this.sortFileImports$(path), 3));
    }
    sortFileImports$(fullFilePath) {
        return helpers_public_1.io.readFile$(fullFilePath).pipe((0, operators_1.switchMap)((file) => {
            const sortedData = this.getSortedData(fullFilePath, file);
            if (sortedData.isSortRequired) {
                const sortedFullFileSource = this.getFullSortedSourceFile(file, sortedData);
                return helpers_public_1.io.writeFile$(fullFilePath, sortedFullFileSource);
            }
            else {
                return (0, rxjs_1.empty)();
            }
        }));
    }
    getFullSortedSourceFile(sourceText, sortedData) {
        var _a;
        const fileSourceArray = sourceText.split('\n');
        const linesToDelete = (0, lodash_1.chain)((_a = sortedData.rangesToDelete) === null || _a === void 0 ? void 0 : _a.map((range) => (0, lodash_1.range)(range.startLine, range.endLine)))
            .flatMap((ranges) => ranges)
            .value();
        for (let i = linesToDelete.length - 1; i >= 0; i--)
            if (i === 0)
                fileSourceArray.splice(linesToDelete[i], 1, sortedData.sortedImportsText);
            else
                fileSourceArray.splice(linesToDelete[i], 1);
        const sortedText = fileSourceArray.join('\n');
        return sortedText;
    }
    allFilePathsUnderThePath$(startingSourcePath) {
        if (!startingSourcePath)
            throw new Error('No directory selected.');
        const allFilesPatterns = ['**/*.ts', '**/*.tsx'];
        const ignore = [];
        const filesPaths$ = allFilesPatterns.map((pattern) => helpers_public_1.io.filePaths$(startingSourcePath, pattern, ignore));
        return (0, rxjs_1.merge)(...filesPaths$);
    }
    isLineEmptyOrWhiteSpace(line) {
        if (!line)
            return true;
        const trimmedLine = line.trim();
        return trimmedLine === '';
    }
    isSourceAlreadySorted(sortedImport, source) {
        if (source.data.length >= sortedImport.data.length &&
            this.isLineEmptyOrWhiteSpace(source.data[sortedImport.data.length - 1]) &&
            ((source.data.length > sortedImport.data.length &&
                !this.isLineEmptyOrWhiteSpace(source.data[sortedImport.data.length])) ||
                (source.data.length === sortedImport.data.length + 1 &&
                    this.isLineEmptyOrWhiteSpace(source.data[sortedImport.data.length])) ||
                source.data.length === sortedImport.data.length) &&
            source.text.replace(/\r/g, '').startsWith(sortedImport.text))
            return true;
        return false;
    }
    getNextNonEmptyLine(startLineIndex, fileSourceArray) {
        const nextLineIndex = startLineIndex + 1;
        if (fileSourceArray.length < 0)
            return null;
        if (nextLineIndex > fileSourceArray.length - 1)
            return { lineNumber: nextLineIndex - 1, isLast: true };
        const nextLine = fileSourceArray[nextLineIndex];
        if (nextLine === undefined)
            return null;
        else if (!this.isLineEmptyOrWhiteSpace(nextLine))
            return { lineNumber: nextLineIndex, isLast: false };
        else
            return this.getNextNonEmptyLine(nextLineIndex, fileSourceArray);
    }
    getRangesToDelete(sortedImportsResult, fileSourceArray, fileSourceText) {
        const sortedImports = (0, lodash_1.chain)(sortedImportsResult.groups)
            .flatMap((x) => x.elements)
            .value();
        const rangesToDelete = [];
        (0, lodash_1.chain)(sortedImports)
            .concat(sortedImportsResult.toRemove)
            .sortBy((x) => x.startPosition.line)
            .forEach((x) => {
            const previousRange = rangesToDelete[rangesToDelete.length - 1];
            const firstLeadingComment = x.importComment.leadingComments[0];
            const lastTrailingComment = x.importComment.trailingComments.reverse()[0];
            const startPosition = firstLeadingComment
                ? helpers_public_1.textProcessing.getPositionByOffset(firstLeadingComment.range.pos, fileSourceText)
                : x.startPosition;
            const endPosition = lastTrailingComment
                ? helpers_public_1.textProcessing.getPositionByOffset(lastTrailingComment.range.end, fileSourceText)
                : x.endPosition;
            let currentRange = new models_public_1.LineRange({
                startLine: startPosition.line,
                startCharacter: startPosition.character,
                endLine: endPosition.line + 1,
                endCharacter: 0
            });
            const nextNonEmptyLine = this.getNextNonEmptyLine(currentRange.endLine - 1, fileSourceArray);
            if (nextNonEmptyLine &&
                !nextNonEmptyLine.isLast &&
                nextNonEmptyLine.lineNumber !== currentRange.endLine) {
                currentRange = new models_public_1.LineRange({
                    startLine: currentRange.startLine,
                    startCharacter: currentRange.startCharacter,
                    endLine: nextNonEmptyLine.lineNumber,
                    endCharacter: 0
                });
            }
            if (!nextNonEmptyLine ||
                (nextNonEmptyLine && nextNonEmptyLine.isLast)) {
                const lastLine = fileSourceArray[fileSourceArray.length - 1];
                currentRange = new models_public_1.LineRange({
                    startLine: currentRange.startLine,
                    startCharacter: currentRange.startCharacter,
                    endLine: fileSourceArray.length - 1,
                    endCharacter: lastLine.length
                });
            }
            if (!previousRange) {
                rangesToDelete.push(currentRange);
                return;
            }
            if (previousRange.isLineIntersecting(currentRange)) {
                rangesToDelete[rangesToDelete.length - 1] =
                    previousRange.union(currentRange);
                return;
            }
            rangesToDelete.push(currentRange);
        })
            .value();
        return rangesToDelete;
    }
    isFileExcludedFromSorting(selectedPath) {
        const excludedFiles = this.configurationProvider.getConfiguration().generalConfiguration
            .exclude || [];
        if (!excludedFiles.length)
            return false;
        const filePath = selectedPath.replace(new RegExp('\\' + path_1.sep, 'g'), '/');
        const isExcluded = excludedFiles.some((fileToExclude) => filePath.match(fileToExclude) !== null);
        return isExcluded;
    }
}
exports.SimpleImportRunner = SimpleImportRunner;
//# sourceMappingURL=import-runner.js.map