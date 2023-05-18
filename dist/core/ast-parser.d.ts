import { ParsedImportValues } from './models/models-public';
export interface AstParser {
    parseImports(fullFilePath: string, _sourceText?: string): ParsedImportValues;
}
export declare class SimpleImportAstParser implements AstParser {
    parseImports(fullFilePath: string, _sourceText?: string): ParsedImportValues;
    private updateFirstNodeLeadingComments;
    private firstImportLineNumber;
    private getLastLeadingComment;
    private createSourceFile;
    private delintImportsAndTypes;
    private getComments;
    private getComment;
    private getCodeLineNumbers;
    private parseImport;
}
//# sourceMappingURL=ast-parser.d.ts.map