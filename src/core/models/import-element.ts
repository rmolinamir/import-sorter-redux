import { Comment } from './comment';

export interface ImportElement {
  moduleSpecifierName: string;
  startPosition: { line: number; character: number };
  endPosition: { line: number; character: number };
  hasFromKeyWord: boolean;
  importComment: {
    leadingComments: Comment[];
    trailingComments: Comment[];
  };
  defaultImportName?: string | null;
  namedBindings?: {
    aliasName?: string | null;
    name: string;
  }[];
}
