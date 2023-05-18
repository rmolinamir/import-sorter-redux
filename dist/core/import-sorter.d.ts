import { ImportElementSortResult } from './models/import-element-sort-result';
import { ImportElement, SortConfiguration } from './models/models-public';
export interface ImportSorter {
    initialize(sortConfig: SortConfiguration): void;
    sortImportElements(imports: ImportElement[]): ImportElementSortResult;
}
export declare class InMemoryImportSorter implements ImportSorter {
    private sortConfig;
    initialize(sortConfig: SortConfiguration): void;
    sortImportElements(imports: ImportElement[]): ImportElementSortResult;
    private assertIsInitialized;
    private normalizePaths;
    private sortNamedBindings;
    private sortModuleSpecifiers;
    private joinImportPaths;
    private getDefaultLineNumber;
    private applyCustomSortingRules;
    private matchNameBindings;
    private addElement;
    private getSortOrderFunc;
    private parseStringWithPeriod;
    private swapStringCase;
}
//# sourceMappingURL=import-sorter.d.ts.map