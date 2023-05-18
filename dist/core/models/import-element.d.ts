import { Comment } from './comment';
export interface ImportElement {
    moduleSpecifierName: string;
    startPosition: {
        line: number;
        character: number;
    };
    endPosition: {
        line: number;
        character: number;
    };
    hasFromKeyWord: boolean;
    defaultImportName?: string;
    namedBindings?: {
        aliasName: string | null;
        name: string;
    }[];
    importComment: {
        leadingComments: Comment[];
        trailingComments: Comment[];
    };
}
//# sourceMappingURL=import-element.d.ts.map