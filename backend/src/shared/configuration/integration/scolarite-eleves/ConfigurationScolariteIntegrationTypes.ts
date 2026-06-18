import type { ConfigurationContext } from '../../context';

export interface ConfigurationScolariteEvenement {
  readonly type: 'INSCRIPTION_VALIDEE' | 'AFFECTATION_CLASSE' | 'ELEVE_SUSPENDU';
  readonly contexte: ConfigurationContext;
  readonly eleveId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationScolariteProjection {
  readonly eleveId: string;
  readonly ecoleId?: string;
  readonly scopeLevel: ConfigurationContext['scopeLevel'];
}

export interface ConfigurationScolariteSnapshot {
  readonly totalEvenements: number;
  readonly projections: readonly ConfigurationScolariteProjection[];
}
