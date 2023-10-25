import { expect } from 'chai';
import { SimpleImportAstParser } from '../src/core/ast-parser';
import {
  defaultSortConfiguration,
  ImportElementSortResult,
  SortConfiguration
} from '../src/core/core-public';
import { InMemoryImportSorter } from '../src/core/import-sorter';

interface ImportSorterTest {
  name: string;
  config: SortConfiguration;
  importDeclaration: string;
  expected: ImportElementSortResult;
}

const createConfiguration = (partialConfig: Partial<SortConfiguration>) =>
  Object.assign({}, defaultSortConfiguration, partialConfig);

suite('ImportSorter', () => {
  const tests: ImportSorterTest[] = [
    {
      name: 'Test 1',
      config: createConfiguration({}),
      importDeclaration: `
      import type { Metadata } from 'next';
      import { Inter } from 'next/font/google';
      import { ThemeProvider } from '@/components/providers/theme-provider';
      import './globals.css';
      `,
      expected: {
        groups: [
          {
            elements: [
              {
                moduleSpecifierName: './globals.css',
                startPosition: {
                  line: 4,
                  character: 6
                },
                endPosition: {
                  line: 4,
                  character: 29
                },
                hasFromKeyWord: false,
                isTypeOnly: false,
                namedBindings: [],
                importComment: {
                  leadingComments: [],
                  trailingComments: []
                },
                quoteMark: 'single'
              }
            ],
            numberOfEmptyLinesAfterGroup: 0,
            customOrderRule: {
              orderLevel: 5,
              regex: '^$',
              type: 'importMember',
              disableSort: true,
              numberOfEmptyLinesAfterGroup: 0
            }
          },
          {
            elements: [
              {
                moduleSpecifierName: 'next',
                startPosition: {
                  line: 1,
                  character: 6
                },
                endPosition: {
                  line: 1,
                  character: 43
                },
                hasFromKeyWord: true,
                isTypeOnly: true,
                namedBindings: [
                  {
                    aliasName: null,
                    name: 'Metadata'
                  }
                ],
                importComment: {
                  leadingComments: [],
                  trailingComments: []
                },
                quoteMark: 'single'
              },
              {
                moduleSpecifierName: 'next/font/google',
                startPosition: {
                  line: 2,
                  character: 6
                },
                endPosition: {
                  line: 2,
                  character: 47
                },
                hasFromKeyWord: true,
                isTypeOnly: false,
                namedBindings: [
                  {
                    aliasName: null,
                    name: 'Inter'
                  }
                ],
                importComment: {
                  leadingComments: [],
                  trailingComments: []
                },
                quoteMark: 'single'
              }
            ],
            numberOfEmptyLinesAfterGroup: 0,
            customOrderRule: {
              orderLevel: 10,
              regex: '^[^.@]',
              type: undefined,
              disableSort: false,
              numberOfEmptyLinesAfterGroup: 0
            }
          },
          {
            elements: [
              {
                moduleSpecifierName: '@/components/providers/theme-provider',
                startPosition: {
                  line: 3,
                  character: 6
                },
                endPosition: {
                  line: 3,
                  character: 76
                },
                hasFromKeyWord: true,
                isTypeOnly: false,
                namedBindings: [
                  {
                    aliasName: null,
                    name: 'ThemeProvider'
                  }
                ],
                importComment: {
                  leadingComments: [],
                  trailingComments: []
                },
                quoteMark: 'single'
              }
            ],
            numberOfEmptyLinesAfterGroup: 0,
            customOrderRule: {
              orderLevel: 15,
              regex: '^[@]',
              type: undefined,
              disableSort: false,
              numberOfEmptyLinesAfterGroup: 0
            }
          }
        ],
        duplicates: []
      }
    }
  ];

  const getImports = (text: string) => {
    const walker = new SimpleImportAstParser();
    const imports = walker.parseImports('nonExistentFile', text);
    return imports;
  };

  tests.forEach(({ name, config, importDeclaration, expected }) => {
    test(`${name}: ImportSorter returns correct ImportElementSortResult`, () => {
      const imports = getImports(importDeclaration);
      const sorter = new InMemoryImportSorter();
      sorter.initialize(config);
      const sortResult = sorter.sortImportElements(imports.importElements);

      expect(sortResult).to.deep.equal(expected);
    });
  });
});
