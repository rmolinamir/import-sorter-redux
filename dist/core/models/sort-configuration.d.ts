import { CustomOrderRule } from './custom-order-rule';
export type ImportSortOrder = 'caseInsensitive' | 'lowercaseFirst' | 'lowercaseLast' | 'unsorted';
export type ImportSortOrderDirection = 'asc' | 'desc';
export interface SortConfiguration {
    importMembers: {
        order: ImportSortOrder;
        direction: ImportSortOrderDirection;
    };
    importPaths: {
        order: ImportSortOrder;
        direction: ImportSortOrderDirection;
    };
    joinImportPaths?: boolean;
    removeUnusedImports?: boolean;
    removeUnusedDefaultImports?: boolean;
    customOrderingRules?: {
        defaultOrderLevel: number;
        disableDefaultOrderSort?: boolean;
        defaultNumberOfEmptyLinesAfterGroup?: number;
        rules: CustomOrderRule[];
    };
}
export declare const defaultSortConfiguration: SortConfiguration;
//# sourceMappingURL=sort-configuration.d.ts.map