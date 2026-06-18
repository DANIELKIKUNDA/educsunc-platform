import type { ConfigurationContext } from '../../context';

export interface ConfigurationPaiementsEvenement {
  readonly type: 'PAIEMENT_VALIDE' | 'ARRIERE_DETECTE' | 'PLAN_FACTURATION_CHANGE';
  readonly contexte: ConfigurationContext;
  readonly compteFacturationId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationPaiementsProjection {
  readonly compteFacturationId: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

export interface ConfigurationPaiementsSnapshot {
  readonly totalEvenements: number;
  readonly projections: readonly ConfigurationPaiementsProjection[];
}
