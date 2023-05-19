import { commands, Disposable, ExtensionContext, Uri, workspace } from 'vscode';

import { ImportSorterExtension } from './import-sorter-extension';

export const activate = (context: ExtensionContext) => {
  const importSorterExtension = new ImportSorterExtension();

  importSorterExtension.initialize();

  const sortImportsCommand: Disposable = commands.registerCommand(
    'extension.sortImports',
    () => {
      importSorterExtension.sortActiveDocumentImportsFromCommand();
    }
  );

  const sortImportsInDirectoryCommand: Disposable = commands.registerCommand(
    'extension.sortImportsInDirectory',
    (uri: Uri) => {
      importSorterExtension.sortImportsInDirectory(uri);
    }
  );

  const onWillSaveTextDocument = workspace.onWillSaveTextDocument((event) =>
    importSorterExtension.sortModifiedDocumentImportsFromOnBeforeSaveCommand(
      event
    )
  );

  context.subscriptions.push(sortImportsCommand);
  context.subscriptions.push(sortImportsInDirectoryCommand);
  context.subscriptions.push(importSorterExtension);
  context.subscriptions.push(onWillSaveTextDocument);
};

// This method is called when your extension is deactivated.
export const deactivate = () => {};
