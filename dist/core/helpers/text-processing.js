"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPositionByOffset = void 0;
function getPositionByOffset(offset, text) {
    const before = text.slice(0, offset);
    const newLines = before.match(/\n/g);
    const line = newLines ? newLines.length : 0;
    const preCharacters = before.match(/(\n|^).*$/g);
    let character = 0;
    if (line !== 0) {
        character =
            preCharacters && preCharacters[0].length
                ? preCharacters[0].length - 1
                : 0;
    }
    else {
        character = preCharacters ? preCharacters[0].length : 0;
    }
    return {
        line,
        character
    };
}
exports.getPositionByOffset = getPositionByOffset;
//# sourceMappingURL=text-processing.js.map