import type { FrontendCapability } from '../permissions/ability.types';

export interface NavigationEntry {
  label: string;
  description: string;
  route: string;
  capability: FrontendCapability;
  shortCode: string;
}
