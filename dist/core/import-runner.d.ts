import { Observable } from 'rxjs';
import { AstParser } from './ast-parser';
import { ImportCreator } from './import-creator';
import { ImportSorter } from './import-sorter';
import { ImportElement, ImportElementGroup, ImportSorterConfiguration, SortedImportData } from './models/models-public';
export interface ConfigurationProvider {
    getConfiguration(): ImportSorterConfiguration;
}
export interface ImportRunner {
    sortImportsInDirectory(directoryPath: string): Observable<void>;
    getSortImportData(filePath: string, fileSource: string): SortedImportData;
}
export interface ImportElementExcludeUnusedResult {
    groups: ImportElementGroup[];
    toRemove: ImportElement[];
}
export declare class SimpleImportRunner implements ImportRunner {
    private parser;
    private sorter;
    private importCreator;
    private configurationProvider;
    constructor(parser: AstParser, sorter: ImportSorter, importCreator: ImportCreator, configurationProvider: ConfigurationProvider);
    getSortImportData(filePath: string, fileSource: string): SortedImportData;
    sortImportsInDirectory(directoryPath: string): Observable<void>;
    private resetConfiguration;
    private getSortedData;
    private getExcludeUnusedImports;
    private sortAllImports$;
    private sortFileImports$;
    private getFullSortedSourceFile;
    private allFilePathsUnderThePath$;
    private isLineEmptyOrWhiteSpace;
    private isSourceAlreadySorted;
    private getNextNonEmptyLine;
    private getRangesToDelete;
    private isFileExcludedFromSorting;
}
//# sourceMappingURL=import-runner.d.ts.map