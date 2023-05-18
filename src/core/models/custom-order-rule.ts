export type CustomOrderRuleType = 'path' | 'importMember';

export interface CustomOrderRule {
  type?: CustomOrderRuleType;
  numberOfEmptyLinesAfterGroup?: number | null;
  disableSort?: boolean;
  regex: string | null;
  orderLevel?: number | null;
}
