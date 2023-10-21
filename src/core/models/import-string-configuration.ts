import { QuoteMark } from './quote-mark';

export interface ImportStringConfiguration {
  maximumNumberOfImportExpressionsPerLine: {
    count: number;
    type:
      | 'words'
      | 'maxLineLength'
      | 'newLineEachExpressionAfterCountLimit'
      | 'newLineEachExpressionAfterCountLimitExceptIfOnlyOne';
  };
  quoteMark: QuoteMark | 'auto';
  tabSize: number;
  tabType: 'tab' | 'space';
  numberOfEmptyLinesAfterAllImports: number;
  trailingComma: 'none' | 'always' | 'multiLine';
  hasSemicolon: boolean;
  spacingPerImportExpression: {
    afterStartingBracket: number;
    beforeEndingBracket: number;
    beforeComma: number;
    afterComma: number;
  };
}
