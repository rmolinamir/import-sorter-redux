import { expect } from 'chai';

import { SimpleImportAstParser } from '../src/core/ast-parser';
import { ImportElement } from '../src/core/core-public';

interface AstTest {
  name: string;
  importDeclaration: string;
  expected: ImportElement;
}

suite('AstParser', () => {
  const tests: AstTest[] = [
    {
      name: 'Test 1',
      importDeclaration: `import { a, c as cc, b } from 'test.js';`,
      expected: {
        endPosition: { line: 0, character: 40 },
        moduleSpecifierName: 'test.js',
        hasFromKeyWord: true,
        isTypeOnly: false,
        namedBindings: [
          { name: 'a', aliasName: null },
          { name: 'c', aliasName: 'cc' },
          { name: 'b', aliasName: null }
        ],
        startPosition: { line: 0, character: 0 },
        importComment: {
          leadingComments: [],
          trailingComments: []
        }
      }
    },
    {
      name: 'Test 2',
      importDeclaration: `//comment
            import  {  a  ,
                    c  as  cc , b
                }
                from 'test.js';

                `,
      expected: {
        moduleSpecifierName: 'test.js',
        startPosition: { line: 1, character: 12 },
        endPosition: { line: 4, character: 31 },
        hasFromKeyWord: true,
        isTypeOnly: false,
        namedBindings: [
          { name: 'a', aliasName: null },
          { name: 'c', aliasName: 'cc' },
          { name: 'b', aliasName: null }
        ],
        importComment: {
          leadingComments: [
            {
              range: {
                end: 9,
                pos: 0,
                kind: 2,
                hasTrailingNewLine: true
              },
              text: '//comment',
              isTripleSlashDirective: false
            }
          ],
          trailingComments: []
        }
      }
    },
    {
      name: 'Test 3',
      importDeclaration: `import { a, c as cc, b } from "test.js"`,
      expected: {
        endPosition: { line: 0, character: 39 },
        moduleSpecifierName: 'test.js',
        hasFromKeyWord: true,
        isTypeOnly: false,
        namedBindings: [
          { name: 'a', aliasName: null },
          { name: 'c', aliasName: 'cc' },
          { name: 'b', aliasName: null }
        ],
        startPosition: { line: 0, character: 0 },
        importComment: {
          leadingComments: [],
          trailingComments: []
        }
      }
    },
    {
      name: 'Test 4',
      importDeclaration: `/* leadingComment1 */
            //leadingComment2
            import  {  a  ,
                    c  as  cc , b
                }
                from 'test.js'; //trailingComment

                `,
      expected: {
        moduleSpecifierName: 'test.js',
        startPosition: { line: 2, character: 12 },
        endPosition: { line: 5, character: 31 },
        hasFromKeyWord: true,
        isTypeOnly: false,
        namedBindings: [
          { name: 'a', aliasName: null },
          { name: 'c', aliasName: 'cc' },
          { name: 'b', aliasName: null }
        ],
        importComment: {
          leadingComments: [
            {
              range: {
                end: 51,
                hasTrailingNewLine: true,
                kind: 2,
                pos: 34
              },
              text: '//leadingComment2',
              isTripleSlashDirective: false
            }
          ],
          trailingComments: [
            {
              range: {
                end: 181,
                hasTrailingNewLine: true,
                kind: 2,
                pos: 164
              },
              text: '//trailingComment',
              isTripleSlashDirective: false
            }
          ]
        }
      }
    },
    {
      name: 'Test 5',
      importDeclaration: `import type { a, b } from "test.js"`,
      expected: {
        endPosition: { line: 0, character: 35 },
        moduleSpecifierName: 'test.js',
        hasFromKeyWord: true,
        isTypeOnly: true,
        namedBindings: [
          { name: 'a', aliasName: null },
          { name: 'b', aliasName: null }
        ],
        startPosition: { line: 0, character: 0 },
        importComment: {
          leadingComments: [],
          trailingComments: []
        }
      }
    }
  ];

  const getImports = (text: string) => {
    const walker = new SimpleImportAstParser();
    const imports = walker.parseImports('nonExistentFile', text);
    return imports;
  };

  tests.forEach(({ name, importDeclaration, expected }) => {
    test(`${name}: AstParser returns correct ImportElement`, () => {
      const imports = getImports(importDeclaration);

      expect(imports.importElements).to.have.lengthOf(1);
      expect(imports.importElements[0]).to.deep.equal(expected);
    });
  });
});
