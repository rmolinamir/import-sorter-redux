export interface ImportStringConfiguration {
  maximumNumberOfImportExpressionsPerLine: {
    count: number;
    type:
      | 'words'
      | 'maxLineLength'
      | 'newLineEachExpressionAfterCountLimit'
      | 'newLineEachExpressionAfterCountLimitExceptIfOnlyOne';
  };
  quoteMark: 'single' | 'double';
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
