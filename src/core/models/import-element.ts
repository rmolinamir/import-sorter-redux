import { Comment } from './comment';
import { QuoteMark } from './quote-mark';

export interface ImportElement {
  moduleSpecifierName: string;
  startPosition: { line: number; character: number };
  endPosition: { line: number; character: number };
  hasFromKeyWord: boolean;
  isTypeOnly: boolean;
  importComment: {
    leadingComments: Comment[];
    trailingComments: Comment[];
  };
  defaultImportName?: string | null;
  namedBindings?: {
    aliasName?: string | null;
    name: string;
  }[];
  quoteMark?: QuoteMark;
}
