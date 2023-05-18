export declare class LineRange {
    startLine: number;
    startCharacter: number;
    endLine: number;
    endCharacter: number;
    isLineIntersecting(range: LineRange): boolean;
    union(range: LineRange): LineRange;
    constructor(json: Pick<LineRange, 'startLine' | 'startCharacter' | 'endLine' | 'endCharacter'>);
}
//# sourceMappingURL=line-range.d.ts.map