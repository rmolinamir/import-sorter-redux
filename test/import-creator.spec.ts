import { expect } from 'chai';

import {
  defaultImportStringConfiguration,
  ImportElementGroup,
  ImportStringConfiguration,
  InMemoryImportCreator
} from '../src/core/core-public';

interface ImportCreatorTest {
  name: string;
  config: ImportStringConfiguration;
  elementGroups: ImportElementGroup[];
  expected: string;
}

const createConfiguration = (partialConfig: ImportStringConfiguration) =>
  Object.assign({}, defaultImportStringConfiguration, partialConfig);

suite('ImportCreator', () => {
  const tests: ImportCreatorTest[] = [
    {
      name: 'Test 1',
      config: createConfiguration({
        numberOfEmptyLinesAfterAllImports: 0,
        maximumNumberOfImportExpressionsPerLine: {
          count: 23,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: 'createString.ts',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 53 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              defaultImportName: 't',
              namedBindings: [
                { name: 'B', aliasName: null },
                { name: 'a', aliasName: 'cc' },
                { name: 'ac', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 3,
          customOrderRule: null
        }
      ],
      expected: "import t, {\n    B, a as cc, ac\n} from 'createString.ts';"
    },
    {
      name: 'Test 2 - Trailing Comma',
      config: createConfiguration({
        numberOfEmptyLinesAfterAllImports: 0,
        maximumNumberOfImportExpressionsPerLine: {
          count: 70,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 70 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import { ChangeDetectionStrategy, DebugElement } from '@angular/core';"
    },
    {
      name: 'Test 3 - Trailing Comma',
      config: createConfiguration({
        numberOfEmptyLinesAfterAllImports: 0,
        maximumNumberOfImportExpressionsPerLine: {
          count: 69,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 70 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import {\n    ChangeDetectionStrategy, DebugElement\n} from '@angular/core';"
    },
    {
      name: 'Test 4 - Trailing Comma',
      config: createConfiguration({
        trailingComma: 'always',
        maximumNumberOfImportExpressionsPerLine: {
          count: 71,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 70 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import { ChangeDetectionStrategy, DebugElement, } from '@angular/core';\n"
    },
    {
      name: 'Test 5 - Trailing Comma',
      config: createConfiguration({
        trailingComma: 'always',
        maximumNumberOfImportExpressionsPerLine: {
          count: 70,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 70 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import {\n    ChangeDetectionStrategy, DebugElement,\n} from '@angular/core';\n"
    },
    {
      name: 'Test 6 - Trailing Comma',
      config: createConfiguration({
        trailingComma: 'multiLine',
        maximumNumberOfImportExpressionsPerLine: {
          count: 70,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 70 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import { ChangeDetectionStrategy, DebugElement } from '@angular/core';\n"
    },
    {
      name: 'Test 7 - Trailing Comma',
      config: createConfiguration({
        trailingComma: 'multiLine',
        maximumNumberOfImportExpressionsPerLine: {
          count: 69,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 70 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import {\n    ChangeDetectionStrategy, DebugElement,\n} from '@angular/core';\n"
    },
    {
      name: 'Test 8 - Optional Semicolon',
      config: createConfiguration({
        hasSemicolon: false,
        maximumNumberOfImportExpressionsPerLine: {
          count: 69,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 70 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import { ChangeDetectionStrategy, DebugElement } from '@angular/core'\n"
    },
    {
      name: 'Test 9 - Optional Semicolon',
      config: createConfiguration({
        hasSemicolon: false,
        maximumNumberOfImportExpressionsPerLine: {
          count: 68,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 69 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'ChangeDetectionStrategy', aliasName: null },
                { name: 'DebugElement', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected:
        "import {\n    ChangeDetectionStrategy, DebugElement\n} from '@angular/core'\n"
    },
    {
      name: 'Test 10 - Multiline Import Declaration',
      config: createConfiguration({
        numberOfEmptyLinesAfterAllImports: 0,
        maximumNumberOfImportExpressionsPerLine: {
          count: 10,
          type: 'maxLineLength'
        }
      } as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: '@angular/core',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 40 },
              hasFromKeyWord: true,
              isTypeOnly: false,
              namedBindings: [
                { name: 'a', aliasName: null },
                { name: 'b', aliasName: null },
                { name: 'c', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected: "import {\n    a, b,\n    c\n} from '@angular/core';"
    },
    {
      name: 'Test 11 - Type-Only Import Declaration',
      config: createConfiguration({} as ImportStringConfiguration),
      elementGroups: [
        {
          elements: [
            {
              moduleSpecifierName: 'foo',
              startPosition: { line: 0, character: 0 },
              endPosition: { line: 0, character: 40 },
              hasFromKeyWord: true,
              isTypeOnly: true,
              namedBindings: [
                { name: 'a', aliasName: null },
                { name: 'b', aliasName: null }
              ],
              importComment: {
                leadingComments: [],
                trailingComments: []
              }
            }
          ],
          numberOfEmptyLinesAfterGroup: 0,
          customOrderRule: null
        }
      ],
      expected: "import type { a, b } from 'foo';\n"
    }
  ];

  tests.forEach(({ name, config, elementGroups, expected }) => {
    test(`${name}: ImportCreator returns correct import declaration`, () => {
      const creator = new InMemoryImportCreator();
      creator.initialize(config);
      const importDeclaration = creator.createImportDeclaration(elementGroups);

      expect(importDeclaration).to.equal(expected);
    });
  });
});
