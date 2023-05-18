"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const import_sorter_extension_1 = require("./import-sorter-extension");
const activate = (context) => {
    const importSorterExtension = new import_sorter_extension_1.ImportSorterExtension();
    importSorterExtension.initialize();
    const sortImportsCommand = vscode_1.commands.registerCommand('extension.sortImports', () => {
        importSorterExtension.sortActiveDocumentImportsFromCommand();
    });
    const sortImportsInDirectoryCommand = vscode_1.commands.registerCommand('extension.sortImportsInDirectory', (uri) => {
        importSorterExtension.sortImportsInDirectories(uri);
    });
    const onWillSaveTextDocument = vscode_1.workspace.onWillSaveTextDocument((event) => importSorterExtension.sortModifiedDocumentImportsFromOnBeforeSaveCommand(event));
    context.subscriptions.push(sortImportsCommand);
    context.subscriptions.push(sortImportsInDirectoryCommand);
    context.subscriptions.push(importSorterExtension);
    context.subscriptions.push(onWillSaveTextDocument);
};
exports.activate = activate;
// this method is called when your extension is deactivated
const deactivate = () => {
    /* */
};
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map