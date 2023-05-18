import { LineRange } from './line-range';
export interface SortedImportData {
    isSortRequired: boolean;
    sortedImportsText: string | null;
    rangesToDelete: LineRange[] | null;
    firstLineNumberToInsertText: number | null;
}
//# sourceMappingURL=sorted-import-data.d.ts.map