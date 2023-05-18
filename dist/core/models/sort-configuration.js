"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSortConfiguration = void 0;
exports.defaultSortConfiguration = {
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
        defaultNumberOfEmptyLinesAfterGroup: 1,
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
//# sourceMappingURL=sort-configuration.js.map