import { TextDocumentWillSaveEvent, Uri } from 'vscode';
import { ImportSorterConfiguration } from './core/core-public';
import { ConfigurationProvider } from './core/import-runner';
export declare class VSCodeConfigurationProvider implements ConfigurationProvider {
    private currentConfiguration;
    getConfiguration(): ImportSorterConfiguration;
    resetConfiguration(): void;
    private _getConfiguration;
}
export declare class ImportSorterExtension {
    private importRunner;
    private configurationProvider;
    initialize(): void;
    dispose(): void;
    sortActiveDocumentImportsFromCommand(): void;
    sortImportsInDirectories(uri: Uri): Thenable<void>;
    sortModifiedDocumentImportsFromOnBeforeSaveCommand(event: TextDocumentWillSaveEvent): void;
    private sortActiveDocumentImports;
    private isSortAllowed;
}
//# sourceMappingURL=import-sorter-extension.d.ts.map