export class LineRange {
  public startLine!: number;
  public startCharacter!: number;
  public endLine!: number;
  public endCharacter!: number;

  constructor(
    data: Pick<
      LineRange,
      'startLine' | 'startCharacter' | 'endLine' | 'endCharacter'
    >
  ) {
    Object.assign(this, data);
  }

  public isLineIntersecting(range: LineRange): boolean {
    // Line comparison:
    const min = this.startLine < range.startLine ? this : range;
    const max = min === this ? range : this;

    // Lines do not intersect:
    if (min.endLine < max.startLine) return false;
    return true;
  }

  public union(range: LineRange): LineRange {
    const min = this.startLine < range.startLine ? this : range;
    const max = min === this ? range : this;

    return new LineRange({
      startLine: min.startLine,
      startCharacter: min.startCharacter,
      endLine: max.endLine,
      endCharacter: max.endCharacter
    });
  }
}
