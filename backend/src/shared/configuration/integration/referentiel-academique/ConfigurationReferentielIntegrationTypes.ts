import type { ConfigurationContext } from '../../context';

export interface ConfigurationReferentielEvenement {
  readonly type: 'ANNEE_SCOLAIRE_ACTIVEE' | 'ECOLE_OUVERTE' | 'STRUCTURE_MISE_A_JOUR';
  readonly contexte: ConfigurationContext;
  readonly referentielId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationReferentielProjection {
  readonly referentielId: string;
  readonly scopeLevel: ConfigurationContext['scopeLevel'];
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

export interface ConfigurationReferentielSnapshot {
  readonly totalEvenements: number;
  readonly projections: readonly ConfigurationReferentielProjection[];
}
