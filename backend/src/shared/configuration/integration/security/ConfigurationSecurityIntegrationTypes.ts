import type { ConfigurationContext } from '../../context';

// Ce fichier declare les types du pont Security vers Configuration.

export interface ConfigurationSecurityDecision {
  readonly autorise: boolean;
  readonly raison?: string;
  readonly niveau: 'INFO' | 'WARN' | 'BLOCK';
}

export interface ConfigurationSecurityEvenement {
  readonly type: 'CONFIG_ACCESS' | 'CONFIG_CHANGE' | 'LOCK_VIOLATION';
  readonly contexte: ConfigurationContext;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationSecurityIncident {
  readonly type: ConfigurationSecurityEvenement['type'];
  readonly configurationId: string;
  readonly raison: string;
  readonly creeLe: Date;
}

export interface ConfigurationSecuritySnapshot {
  readonly incidents: readonly ConfigurationSecurityIncident[];
  readonly totalIncidents: number;
}
