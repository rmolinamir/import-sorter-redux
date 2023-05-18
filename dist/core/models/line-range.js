"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineRange = void 0;
class LineRange {
    isLineIntersecting(range) {
        // line comparison
        const min = this.startLine < range.startLine ? this : range;
        const max = min === this ? range : this;
        // lines do not intersect
        if (min.endLine < max.startLine) {
            return false;
        }
        return true;
    }
    union(range) {
        const min = this.startLine < range.startLine ? this : range;
        const max = min === this ? range : this;
        return new LineRange({
            startLine: min.startLine,
            startCharacter: min.startCharacter,
            endLine: max.endLine,
            endCharacter: max.endCharacter
        });
    }
    constructor(json) {
        Object.assign(this, json);
    }
}
exports.LineRange = LineRange;
//# sourceMappingURL=line-range.js.map