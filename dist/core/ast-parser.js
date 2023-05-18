"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleImportAstParser = void 0;
const fs_1 = __importDefault(require("fs"));
const typescript_1 = __importDefault(require("typescript"));
const helpers_public_1 = require("./helpers/helpers-public");
class SimpleImportAstParser {
    parseImports(fullFilePath, _sourceText) {
        if (_sourceText !== null &&
            _sourceText !== undefined &&
            _sourceText.trim() === '') {
            return {
                importElements: [],
                usedTypeReferences: [],
                firstImportLineNumber: null
            };
        }
        const sourceText = _sourceText || fs_1.default.readFileSync(fullFilePath).toString();
        const sourceFile = this.createSourceFile(fullFilePath, sourceText);
        const importsAndTypes = this.delintImportsAndTypes(sourceFile, sourceText);
        this.updateFirstNodeLeadingComments(importsAndTypes.importNodes, sourceText);
        return {
            importElements: importsAndTypes.importNodes
                .map((x) => this.parseImport(x, sourceFile))
                .filter((x) => x !== null),
            usedTypeReferences: importsAndTypes.usedTypeReferences,
            firstImportLineNumber: this.firstImportLineNumber(importsAndTypes.importNodes[0], sourceText)
        };
    }
    updateFirstNodeLeadingComments(importNodes, text) {
        const firstNode = importNodes[0];
        if (!firstNode)
            return;
        else if (!firstNode.importComment.leadingComments.length)
            return;
        const lastLeadingComment = this.getLastLeadingComment(firstNode);
        const leadingCommentNextLine = helpers_public_1.textProcessing.getPositionByOffset(lastLeadingComment.range.end, text)
            .line + 1;
        if (firstNode.start.line - leadingCommentNextLine >= 1) {
            // if we have leading comments, and there is at least one line which separates them from import, then we do not consider it
            // to be a leading comment belonging to node
            firstNode.importComment.leadingComments = [];
        }
        else {
            // if we have leading comments then only take the last one;
            firstNode.importComment.leadingComments = [lastLeadingComment];
        }
    }
    firstImportLineNumber(importNode, text) {
        if (!importNode)
            return null;
        const leadingComments = this.getLastLeadingComment(importNode);
        if (leadingComments)
            return helpers_public_1.textProcessing.getPositionByOffset(leadingComments.range.pos, text)
                .line;
        return importNode.start.line;
    }
    getLastLeadingComment(importNode) {
        if (!importNode)
            return null;
        return importNode.importComment.leadingComments &&
            importNode.importComment.leadingComments.length
            ? importNode.importComment.leadingComments[importNode.importComment.leadingComments.length - 1]
            : null;
    }
    createSourceFile(fullFilePath, sourceText) {
        return typescript_1.default.createSourceFile(fullFilePath, sourceText, typescript_1.default.ScriptTarget.Latest, false);
    }
    delintImportsAndTypes(sourceFile, sourceText) {
        const importNodes = [];
        const usedTypeReferences = [];
        const sourceFileText = sourceText || sourceFile.getText();
        const delintNode = (node) => {
            let isSkipChildNode = false;
            switch (node.kind) {
                case typescript_1.default.SyntaxKind.ImportDeclaration: {
                    const lines = this.getCodeLineNumbers(node, sourceFile);
                    importNodes.push({
                        importDeclaration: node,
                        start: lines.importStartLine,
                        end: lines.importEndLine,
                        importComment: this.getComments(sourceFileText, node)
                    });
                    this.getCodeLineNumbers(node, sourceFile);
                    // if we get import declaration then we do not want to do further delinting on the children of the node
                    isSkipChildNode = true;
                    break;
                }
                case typescript_1.default.SyntaxKind.Identifier: {
                    // adding all identifiers(except from the ImportDeclarations). This is quite verbose, but seems to do the trick.
                    usedTypeReferences.push(node.getText(sourceFile));
                    break;
                }
                default:
                    break;
            }
            if (!isSkipChildNode)
                typescript_1.default.forEachChild(node, delintNode);
        };
        delintNode(sourceFile);
        return { importNodes, usedTypeReferences };
    }
    getComments(sourceFileText, node) {
        const leadingComments = (typescript_1.default.getLeadingCommentRanges(sourceFileText, node.getFullStart()) || []).map((range) => this.getComment(range, sourceFileText));
        const trailingComments = (typescript_1.default.getTrailingCommentRanges(sourceFileText, node.getEnd()) || []).map((range) => this.getComment(range, sourceFileText));
        return { leadingComments, trailingComments };
    }
    getComment(range, sourceFileText) {
        const text = sourceFileText.slice(range.pos, range.end).replace(/\r/g, '');
        const comment = {
            range,
            text,
            isTripleSlashDirective: text.match(/\/\/\/\s?</g) != null
        };
        return comment;
    }
    getCodeLineNumbers(node, sourceFile) {
        const importStartLine = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const importEndLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
        return { importStartLine, importEndLine };
    }
    parseImport(importNode, sourceFile) {
        var _a;
        const moduleSpecifierName = importNode.importDeclaration.moduleSpecifier.kind ===
            typescript_1.default.SyntaxKind.StringLiteral
            ? importNode.importDeclaration.moduleSpecifier
                .text
            : importNode.importDeclaration.moduleSpecifier
                .getFullText(sourceFile)
                .trim();
        const result = {
            moduleSpecifierName,
            startPosition: importNode.start,
            endPosition: importNode.end,
            hasFromKeyWord: false,
            namedBindings: [],
            importComment: importNode.importComment
        };
        const importClause = importNode.importDeclaration.importClause;
        if (!importClause) {
            return result;
        }
        if (importClause.name) {
            result.hasFromKeyWord = true;
            result.defaultImportName = importClause.name.text;
        }
        if (!importClause.namedBindings) {
            return result;
        }
        result.hasFromKeyWord = true;
        if (importClause.namedBindings.kind === typescript_1.default.SyntaxKind.NamespaceImport) {
            const nsImport = importClause.namedBindings;
            (_a = result.namedBindings) === null || _a === void 0 ? void 0 : _a.push({ aliasName: nsImport.name.text, name: '*' });
            return result;
        }
        if (importClause.namedBindings.kind === typescript_1.default.SyntaxKind.NamedImports) {
            const nImport = importClause.namedBindings;
            nImport.elements.forEach((y) => {
                var _a;
                const propertyName = y.propertyName ? y.propertyName.text : y.name.text;
                const aliasName = !y.propertyName ? null : y.name.text;
                (_a = result.namedBindings) === null || _a === void 0 ? void 0 : _a.push({ aliasName, name: propertyName });
            });
            return result;
        }
        console.warn('unsupported import: ', JSON.stringify(importClause));
        return null;
    }
}
exports.SimpleImportAstParser = SimpleImportAstParser;
//# sourceMappingURL=ast-parser.js.map