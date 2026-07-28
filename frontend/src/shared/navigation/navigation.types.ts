import type { FrontendGovernanceLevel } from '../doctrine/doctrine.types';
import type { FrontendPageAction } from '../doctrine/doctrine.types';

export interface NavigationChildEntry {
  code: string;
  label: string;
  route: string;
  routeName: string;
  icon: string;
  sectionCode: string;
  sectionLabel: string;
  visibleActions: readonly FrontendPageAction[];
}

export interface NavigationEntry {
  code: string;
  label: string;
  description: string;
  route: string;
  icon: string;
  governanceLevels: readonly FrontendGovernanceLevel[];
  actorCodes: readonly string[];
  visibleActions: readonly FrontendPageAction[];
  children: readonly NavigationChildEntry[];
}
