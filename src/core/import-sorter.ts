import { SortConfiguration, ImportElement, ImportSortOrder } from './models';
import { chain, cloneDeep, isNil, LoDashExplicitArrayWrapper } from 'lodash';
import { ImportElementSortResult } from './models/import-element-sort-result';
import * as path from 'path';

export class ImportSorter {
    private sortConfig: SortConfiguration;

    public initialise(sortConfig: SortConfiguration) {
        this.sortConfig = sortConfig;
    }

    public sortImportElements(imports: ImportElement[]): ImportElementSortResult {
        this.assertIsinitialised();
        const clonedElements = cloneDeep(imports);
        const joinedImportsResult = this.joinNamedImports(clonedElements);
        const duplicates = joinedImportsResult.duplicates;
        const sortedImportsExpr = this.sortNamedBindings(joinedImportsResult.joinedExpr);
        const sortedByModule = this.sortModuleSpecifiers(sortedImportsExpr);
        const sortedElements = this.applyCustomSortingRules(sortedByModule);
        return {
            sorted: sortedElements,
            duplicates: duplicates
        };
    }

    private assertIsinitialised() {
        if (!this.sortConfig) {
            throw new Error('SortConfiguration: has not been initialised');
        }
    }

    private normalizePaths(imports: ImportElement[]) {
        return chain(imports).map(x => {
            const isRelativePath = x.moduleSpecifierName.startsWith('./');
            x.moduleSpecifierName = path
                .normalize(x.moduleSpecifierName)
                .replace(new RegExp('\\' + path.sep, 'g'), '/');
            if (isRelativePath) {
                x.moduleSpecifierName = `./${x.moduleSpecifierName}`;
            }
            return x;
        });
    }

    private sortNamedBindings(importsExpr: LoDashExplicitArrayWrapper<ImportElement>): LoDashExplicitArrayWrapper<ImportElement> {
        const sortOrder = this.getSortOrderFunc(this.sortConfig.importSources.order);
        return importsExpr.map(x => {
            if (x.namedBindings && x.namedBindings.length) {
                x.namedBindings =
                    chain(x.namedBindings)
                        .orderBy((y: { name: string }) => sortOrder(y.name), [this.sortConfig.importSources.direction])
                        .value();
                return x;
            }
            return x;
        });
    }

    private joinNamedImports(imports: ImportElement[]): { joinedExpr: LoDashExplicitArrayWrapper<ImportElement>, duplicates: ImportElement[] } {
        const normalizedPathsExpr = this.normalizePaths(imports);
        if (!this.sortConfig.joinNamedImports) {
            return {
                joinedExpr: normalizedPathsExpr,
                duplicates: []
            };
        }
        const duplicates = [];
        const joined = normalizedPathsExpr
            .groupBy(x => x.moduleSpecifierName)
            .map((x: ImportElement[]) => {
                if (x.length > 1) {
                    const nameBindings = chain(x).flatMap(y => y.namedBindings).value();
                    const defaultImportElement = x.find(y => !isNil(y.defaultImportName) && !(y.defaultImportName.trim() === ''));
                    const defaultImportName = defaultImportElement ? defaultImportElement.defaultImportName : null;
                    x[0].defaultImportName = defaultImportName;
                    x[0].namedBindings = nameBindings;
                    duplicates.push(...x.slice(1));
                    return x[0];
                }
                return x[0];
            })
            .value();
        return {
            joinedExpr: chain(joined),
            duplicates: duplicates
        };
    }

    private sortModuleSpecifiers(importsExpr: LoDashExplicitArrayWrapper<ImportElement>): ImportElement[] {

        const groups = importsExpr.groupBy(x => x.moduleSpecifierName.startsWith('.') || x.moduleSpecifierName.startsWith('/')).toPairs();
        const sortOrder = this.getSortOrderFunc(this.sortConfig.namedImports.order);
        const sortedGroups = groups.filter(x => x[1]).map(x => {
            if (x[0] === 'true') {
                //path sorting
                return chain(x[1]).orderBy((y: ImportElement) => sortOrder(y.moduleSpecifierName), [this.sortConfig.namedImports.direction]).value();
            } else {
                //non path sorting
                return chain(x[1]).orderBy((y: ImportElement) => sortOrder(y.moduleSpecifierName), [this.sortConfig.namedImports.direction]).value();
            }
        });
        const flattenedValuesFunc = sortedGroups.flatMap().value() as ImportElement[];
        return flattenedValuesFunc;
    }

    private applyCustomSortingRules(sortedImports: ImportElement[]): ImportElement[] {
        if (!this.sortConfig.customOrderingRules) {
            return sortedImports;
        }
        const rules = this.sortConfig
            .customOrderingRules
            .rules
            .map(x => ({
                pos: x.orderLevel,
                expr: this.escapeRegExp(x.regex)
            }));

        const result: { [key: number]: ImportElement[] } = {};
        sortedImports.forEach(x => {
            const rule = rules.find(e => x.moduleSpecifierName.match(e.expr) !== null);
            if (!rule) {
                this.addElement(result, this.sortConfig.customOrderingRules.defaultOrderLevel, x);
                return;
            }
            this.addElement(result, rule.pos, x);
        });
        const customSortedImports = chain(Object.keys(result)).orderBy(x => x).map(x => result[x]).flatMap(x => x).value();

        return customSortedImports;
    }

    private addElement(dictionary: { [key: number]: ImportElement[] }, key: number, value: ImportElement) {
        if (isNil(dictionary[key])) {
            dictionary[key] = [value];
        } else {
            dictionary[key].push(value);
        }
    }

    private getSortOrderFunc(sortOrder: ImportSortOrder): ((value: string) => string) {
        if (sortOrder === 'caseInsensitive') {
            return (x) => x.toLowerCase();
        }
        if (sortOrder === 'lowercaseLast') {
            return (x) => x;
        }
        if (sortOrder === 'unsorted') {
            return (_x) => '';
        }
        if (sortOrder === 'lowercaseFirst') {
            return (x) => this.swapStringCase(x);
        }
    }

    private swapStringCase(str: string) {
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

    private escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }

}