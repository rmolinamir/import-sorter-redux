import { ImportElementGroup, ImportStringConfiguration } from './models/models-public';
export interface ImportCreator {
    initialize(importStringConfig: ImportStringConfiguration): void;
    createImportText(groups: ImportElementGroup[]): string;
}
export declare class InMemoryImportCreator implements ImportCreator {
    private importStringConfig;
    initialize(importStringConfig: ImportStringConfiguration): void;
    createImportText(groups: ImportElementGroup[]): string;
    private createImportStrings;
    private assertIsInitialized;
    private createSingleImportString;
    private createStarImport;
    private createCurlyBracketElement;
    private createNameBindingChunks;
    private createNameBindingChunksByWords;
    private createNameBindingChunksByLength;
    private appendTrailingComma;
    private createImportWithCurlyBracket;
    private getSpaceConfig;
    private getQuoteMark;
    private get semicolonChar();
    private repeatString;
}
//# sourceMappingURL=import-creator.d.ts.map