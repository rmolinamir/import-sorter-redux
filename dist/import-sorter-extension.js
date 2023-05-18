"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSorterExtension = exports.VSCodeConfigurationProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const path_1 = require("path");
const operators_1 = require("rxjs/operators");
const vscode_1 = require("vscode");
const core_public_1 = require("./core/core-public");
const EXTENSION_CONFIGURATION_NAME = 'importSorter';
class VSCodeConfigurationProvider {
    getConfiguration() {
        return this.currentConfiguration;
    }
    resetConfiguration() {
        this.currentConfiguration = this._getConfiguration();
    }
    _getConfiguration() {
        const generalConfigProxy = vscode_1.workspace
            .getConfiguration(EXTENSION_CONFIGURATION_NAME)
            .get('generalConfiguration');
        const generalConfig = (0, lodash_1.cloneDeep)(generalConfigProxy);
        const configPath = `${vscode_1.workspace.rootPath}${path_1.sep}${generalConfig.configurationFilePath}`;
        const isConfigExist = fs_1.default.existsSync(configPath);
        if (!isConfigExist &&
            generalConfig.configurationFilePath !==
                core_public_1.defaultGeneralConfiguration.configurationFilePath) {
            console.error('configurationFilePath is not found by the following path, import sorter will proceed with defaults from settings', configPath);
            vscode_1.window.showErrorMessage('configurationFilePath is not found by the following path, import sorter will proceed with defaults from settings', configPath);
        }
        const fileConfigurationString = isConfigExist
            ? fs_1.default.readFileSync(configPath, 'utf8')
            : '{}';
        const fileConfigJsonObj = JSON.parse(fileConfigurationString);
        const fileConfigMerged = Object.keys(fileConfigJsonObj)
            .map((key) => {
            const total = {};
            const keys = key.split('.').filter((str) => str !== 'importSorter');
            keys.reduce((sum, currentKey, index) => {
                if (index === keys.length - 1)
                    sum[currentKey] = fileConfigJsonObj[key];
                else
                    sum[currentKey] = {};
                return sum[currentKey];
            }, total);
            return total;
        })
            .reduce((sum, currentObj) => (0, lodash_1.merge)(sum, currentObj), {});
        const fileConfig = fileConfigMerged;
        const sortConfigProxy = vscode_1.workspace
            .getConfiguration(EXTENSION_CONFIGURATION_NAME)
            .get('sortConfiguration');
        const sortConfig = (0, lodash_1.cloneDeep)(sortConfigProxy);
        const importStringConfigProxy = vscode_1.workspace
            .getConfiguration(EXTENSION_CONFIGURATION_NAME)
            .get('importStringConfiguration');
        const importStringConfig = (0, lodash_1.cloneDeep)(importStringConfigProxy);
        const sortConfiguration = (0, lodash_1.merge)(sortConfig, fileConfig.sortConfiguration || {});
        const importStringConfiguration = (0, lodash_1.merge)(importStringConfig, fileConfig.importStringConfiguration || {});
        const generalConfiguration = (0, lodash_1.merge)(generalConfig, fileConfig.generalConfiguration || {});
        return {
            sortConfiguration,
            importStringConfiguration,
            generalConfiguration
        };
    }
}
exports.VSCodeConfigurationProvider = VSCodeConfigurationProvider;
class ImportSorterExtension {
    initialize() {
        this.configurationProvider = new VSCodeConfigurationProvider();
        this.importRunner = new core_public_1.SimpleImportRunner(new core_public_1.SimpleImportAstParser(), new core_public_1.InMemoryImportSorter(), new core_public_1.InMemoryImportCreator(), this.configurationProvider);
    }
    dispose() { }
    sortActiveDocumentImportsFromCommand() {
        if (!vscode_1.window.activeTextEditor ||
            !this.isSortAllowed(vscode_1.window.activeTextEditor.document, false)) {
            return;
        }
        this.configurationProvider.resetConfiguration();
        return this.sortActiveDocumentImports();
    }
    sortImportsInDirectories(uri) {
        this.configurationProvider.resetConfiguration();
        const sortImports$ = this.importRunner.sortImportsInDirectory(uri.fsPath);
        return vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: 'Import sorter: sorting...',
            cancellable: false
        }, (progress) => {
            progress.report({ increment: 0 });
            return sortImports$
                .pipe((0, operators_1.map)(() => 1), (0, operators_1.scan)((acc, curr) => acc + curr, 0), (0, operators_1.map)((fileCount) => progress.report({ message: `${fileCount} - sorted` })), (0, operators_1.delay)(1000))
                .toPromise();
        });
    }
    sortModifiedDocumentImportsFromOnBeforeSaveCommand(event) {
        this.configurationProvider.resetConfiguration();
        const configuration = this.configurationProvider.getConfiguration();
        const isSortOnBeforeSaveEnabled = configuration.generalConfiguration.sortOnBeforeSave;
        if (!isSortOnBeforeSaveEnabled) {
            return;
        }
        if (!this.isSortAllowed(event.document, true)) {
            return;
        }
        return this.sortActiveDocumentImports(event);
    }
    sortActiveDocumentImports(event) {
        var _a, _b;
        try {
            const doc = event
                ? event.document
                : vscode_1.window.activeTextEditor.document;
            const text = doc.getText();
            const importData = this.importRunner.getSortImportData(doc.uri.fsPath, text);
            if (!importData.isSortRequired) {
                return;
            }
            const deleteEdits = (_a = importData.rangesToDelete) === null || _a === void 0 ? void 0 : _a.map((x) => vscode_1.TextEdit.delete(new vscode_1.Range(new vscode_1.Position(x.startLine, x.startCharacter), new vscode_1.Position(x.endLine, x.endCharacter))));
            if (event && deleteEdits) {
                const insertEdit = vscode_1.TextEdit.insert(new vscode_1.Position(importData.firstLineNumberToInsertText, 0), importData.sortedImportsText + '\n');
                event.waitUntil(Promise.resolve([...deleteEdits, insertEdit]));
            }
            else {
                (_b = vscode_1.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.edit((editBuilder) => {
                    deleteEdits === null || deleteEdits === void 0 ? void 0 : deleteEdits.forEach((x) => {
                        editBuilder.delete(x.range);
                    });
                    editBuilder.insert(new vscode_1.Position(importData.firstLineNumberToInsertText, 0), importData.sortedImportsText + '\n');
                });
            }
        }
        catch (error) {
            vscode_1.window.showErrorMessage(`Typescript import sorter failed with - ${error.message}. Please log a bug.`);
        }
    }
    isSortAllowed(document, isFileExtensionErrorIgnored) {
        if (!document) {
            return false;
        }
        if (document.languageId === 'typescript' ||
            document.languageId === 'typescriptreact') {
            return true;
        }
        if (isFileExtensionErrorIgnored) {
            return false;
        }
        vscode_1.window.showErrorMessage('Import Sorter currently only supports typescript (.ts) or typescriptreact (.tsx) language files');
        return false;
    }
}
exports.ImportSorterExtension = ImportSorterExtension;
//# sourceMappingURL=import-sorter-extension.js.map