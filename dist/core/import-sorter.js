"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryImportSorter = void 0;
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
const NEW_PERIOD_CHAR = String.fromCharCode(128);
class InMemoryImportSorter {
    initialize(sortConfig) {
        this.sortConfig = sortConfig;
    }
    sortImportElements(imports) {
        this.assertIsInitialized();
        const clonedElements = (0, lodash_1.cloneDeep)(imports);
        const joinedImportsResult = this.joinImportPaths(clonedElements);
        const duplicates = joinedImportsResult.duplicates;
        const sortedImportsExpr = this.sortNamedBindings(joinedImportsResult.joinedExpr);
        const sortedElementGroups = this.applyCustomSortingRules(sortedImportsExpr);
        this.sortModuleSpecifiers(sortedElementGroups);
        return {
            groups: sortedElementGroups,
            duplicates
        };
    }
    assertIsInitialized() {
        if (!this.sortConfig) {
            throw new Error('SortConfiguration: has not been initialized');
        }
    }
    normalizePaths(imports) {
        return (0, lodash_1.chain)(imports).map((x) => {
            const isRelativePath = x.moduleSpecifierName.startsWith(`.`) ||
                x.moduleSpecifierName.startsWith(`..`);
            x.moduleSpecifierName = isRelativePath
                ? path_1.default
                    .normalize(x.moduleSpecifierName)
                    .replace(new RegExp('\\' + path_1.default.sep, 'g'), '/')
                : x.moduleSpecifierName;
            if (isRelativePath &&
                !x.moduleSpecifierName.startsWith(`./`) &&
                !x.moduleSpecifierName.startsWith(`../`)) {
                if (x.moduleSpecifierName === '.') {
                    x.moduleSpecifierName = './';
                }
                else if (x.moduleSpecifierName === '..') {
                    x.moduleSpecifierName = '../';
                }
                else {
                    x.moduleSpecifierName = `./${x.moduleSpecifierName}`;
                }
            }
            return x;
        });
    }
    sortNamedBindings(importsExpr) {
        const sortOrder = this.getSortOrderFunc(this.sortConfig.importMembers.order);
        return importsExpr.map((x) => {
            if (x.namedBindings && x.namedBindings.length) {
                x.namedBindings = (0, lodash_1.chain)(x.namedBindings)
                    .orderBy((y) => sortOrder(y.name), [this.sortConfig.importMembers.direction])
                    .value();
                return x;
            }
            return x;
        });
    }
    sortModuleSpecifiers(elementGroups) {
        const sortOrder = this.getSortOrderFunc(this.sortConfig.importPaths.order, true);
        elementGroups
            .filter((gr) => { var _a; return !((_a = gr.customOrderRule) === null || _a === void 0 ? void 0 : _a.disableSort); })
            .forEach((gr) => {
            gr.elements = (0, lodash_1.chain)(gr.elements)
                .orderBy((y) => sortOrder(y.moduleSpecifierName), [this.sortConfig.importPaths.direction])
                .value();
        });
    }
    joinImportPaths(imports) {
        const normalizedPathsExpr = this.normalizePaths(imports);
        if (!this.sortConfig.joinImportPaths)
            return {
                joinedExpr: normalizedPathsExpr,
                duplicates: []
            };
        const duplicates = [];
        const joined = normalizedPathsExpr
            .groupBy((x) => x.moduleSpecifierName)
            .map((x) => {
            if (x.length > 1) {
                // removing duplicates by module specifiers
                const nameBindings = (0, lodash_1.chain)(x)
                    .flatMap((y) => y.namedBindings)
                    .uniqBy((y) => y === null || y === void 0 ? void 0 : y.name)
                    .value();
                const defaultImportElement = x.find((y) => !(0, lodash_1.isNil)(y.defaultImportName) &&
                    !(y.defaultImportName.trim() === ''));
                const defaultImportName = defaultImportElement
                    ? defaultImportElement.defaultImportName
                    : null;
                x[0].defaultImportName = defaultImportName;
                x[0].namedBindings = nameBindings;
                duplicates.push(...x.slice(1));
                return x[0];
            }
            else {
                // removing duplicate name bindings
                const nameBindings = (0, lodash_1.chain)(x)
                    .flatMap((y) => y.namedBindings)
                    .uniqBy((y) => y === null || y === void 0 ? void 0 : y.name)
                    .value();
                x[0].namedBindings = nameBindings;
            }
            return x[0];
        })
            .value();
        return {
            joinedExpr: (0, lodash_1.chain)(joined),
            duplicates
        };
    }
    getDefaultLineNumber() {
        if (this.sortConfig.customOrderingRules &&
            this.sortConfig.customOrderingRules.defaultNumberOfEmptyLinesAfterGroup) {
            return this.sortConfig.customOrderingRules
                .defaultNumberOfEmptyLinesAfterGroup;
        }
        return 0;
    }
    applyCustomSortingRules(sortedImports) {
        if (!this.sortConfig.customOrderingRules ||
            !this.sortConfig.customOrderingRules.rules ||
            this.sortConfig.customOrderingRules.rules.length === 0) {
            const customRules = this.sortConfig.customOrderingRules;
            return [
                {
                    elements: sortedImports.value(),
                    numberOfEmptyLinesAfterGroup: this.getDefaultLineNumber(),
                    customOrderRule: {
                        disableSort: customRules
                            ? customRules.disableDefaultOrderSort
                            : false,
                        numberOfEmptyLinesAfterGroup: customRules
                            ? customRules.defaultNumberOfEmptyLinesAfterGroup
                            : null,
                        orderLevel: customRules ? customRules.defaultOrderLevel : null,
                        regex: null
                    }
                }
            ];
        }
        const rules = this.sortConfig.customOrderingRules.rules.map((x) => ({
            orderLevel: x.orderLevel,
            regex: x.regex,
            type: x.type,
            disableSort: x.disableSort,
            numberOfEmptyLinesAfterGroup: (0, lodash_1.isNil)(x.numberOfEmptyLinesAfterGroup)
                ? this.getDefaultLineNumber()
                : x.numberOfEmptyLinesAfterGroup
        }));
        const result = {};
        sortedImports
            .forEach((x) => {
            var _a, _b;
            const rule = rules.find((e) => !e.type || e.type === 'path'
                ? x.moduleSpecifierName.match(e.regex) !== null
                : this.matchNameBindings(x, e.regex));
            if (!rule) {
                this.addElement(result, {
                    disableSort: (_a = this.sortConfig.customOrderingRules) === null || _a === void 0 ? void 0 : _a.disableDefaultOrderSort,
                    numberOfEmptyLinesAfterGroup: this.getDefaultLineNumber(),
                    orderLevel: (_b = this.sortConfig.customOrderingRules) === null || _b === void 0 ? void 0 : _b.defaultOrderLevel,
                    regex: null
                }, x);
                return;
            }
            this.addElement(result, rule, x);
        })
            .value();
        const customSortedImports = (0, lodash_1.chain)(Object.keys(result))
            .orderBy((x) => +x)
            .map((x) => result[x])
            .value();
        return customSortedImports;
    }
    matchNameBindings(importElement, regex) {
        var _a;
        if (!importElement.hasFromKeyWord)
            return ''.match(regex) !== null;
        if (importElement.defaultImportName &&
            importElement.defaultImportName.trim() !== '')
            return importElement.defaultImportName.match(regex) !== null;
        return (_a = importElement.namedBindings) === null || _a === void 0 ? void 0 : _a.some((x) => x.name.match(regex) !== null);
    }
    addElement(dictionary, rule, value) {
        if ((0, lodash_1.isNil)(dictionary[rule.orderLevel])) {
            dictionary[rule.orderLevel] = {
                elements: [],
                numberOfEmptyLinesAfterGroup: rule.numberOfEmptyLinesAfterGroup,
                customOrderRule: rule
            };
            dictionary[rule.orderLevel].elements = [value];
        }
        else
            dictionary[rule.orderLevel].elements.push(value);
    }
    getSortOrderFunc(sortOrder, changePeriodOrder = false) {
        if (sortOrder === 'caseInsensitive')
            return (x) => changePeriodOrder
                ? this.parseStringWithPeriod(x.toLowerCase())
                : x.toLowerCase();
        if (sortOrder === 'lowercaseLast')
            return (x) => (changePeriodOrder ? this.parseStringWithPeriod(x) : x);
        if (sortOrder === 'unsorted')
            return () => '';
        if (sortOrder === 'lowercaseFirst')
            return (x) => changePeriodOrder
                ? this.parseStringWithPeriod(this.swapStringCase(x))
                : this.swapStringCase(x);
    }
    parseStringWithPeriod(value) {
        return value && value.startsWith('.')
            ? value.replace('.', NEW_PERIOD_CHAR)
            : value;
    }
    swapStringCase(str) {
        if (str == null) {
            return '';
        }
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const c = str[i];
            const u = c.toUpperCase();
            result += u === c ? c.toLowerCase() : u;
        }
        return result;
    }
}
exports.InMemoryImportSorter = InMemoryImportSorter;
//# sourceMappingURL=import-sorter.js.map