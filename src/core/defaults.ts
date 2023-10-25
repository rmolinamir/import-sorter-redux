import {
  GeneralConfiguration,
  ImportStringConfiguration,
  SortConfiguration
} from './core-public';

export const defaultGeneralConfiguration: GeneralConfiguration = {
  configurationFilePath: './import-sorter.json',
  sortOnBeforeSave: false,
  exclude: []
};

export const defaultImportStringConfiguration: ImportStringConfiguration = {
  tabSize: 4,
  tabType: 'space',
  numberOfEmptyLinesAfterAllImports: 1,
  trailingComma: 'none',
  quoteMark: 'auto',
  maximumNumberOfImportExpressionsPerLine: {
    count: 80,
    type: 'maxLineLength'
  },
  hasSemicolon: true,
  spacingPerImportExpression: {
    afterStartingBracket: 1,
    beforeEndingBracket: 1,
    beforeComma: 0,
    afterComma: 1
  }
};

export const defaultSortConfiguration: SortConfiguration = {
  importMembers: {
    order: 'caseInsensitive',
    direction: 'asc'
  },
  importPaths: {
    order: 'caseInsensitive',
    direction: 'asc'
  },
  joinImportPaths: true,
  removeUnusedImports: false,
  removeUnusedDefaultImports: false,
  customOrderingRules: {
    defaultOrderLevel: 20,
    defaultNumberOfEmptyLinesAfterGroup: 0,
    disableDefaultOrderSort: false,
    rules: [
      {
        type: 'importMember',
        regex: '^$',
        orderLevel: 5,
        disableSort: true
      },
      {
        regex: '^[^.@]',
        orderLevel: 10,
        disableSort: false
      },
      {
        regex: '^[@]',
        orderLevel: 15,
        disableSort: false
      },
      {
        regex: '^[.]',
        orderLevel: 30,
        disableSort: false
      }
    ]
  }
};
