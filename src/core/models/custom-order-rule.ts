export type CustomOrderRuleType = 'path' | 'importMember';

export interface CustomOrderRule {
  type?: CustomOrderRuleType | null;
  numberOfEmptyLinesAfterGroup?: number | null;
  disableSort?: boolean | null;
  regex?: string | null;
  orderLevel?: number | null;
}
