import type { ConfigurationContext } from '../../context';

export interface ConfigurationBulletinsEvenement {
  readonly type: 'PERIODE_CLOTUREE' | 'BULLETIN_PUBLIE' | 'REGLE_EVALUATION_CHANGE';
  readonly contexte: ConfigurationContext;
  readonly bulletinId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationBulletinsProjection {
  readonly bulletinId: string;
  readonly ecoleId?: string;
  readonly organisationId?: string;
}

export interface ConfigurationBulletinsSnapshot {
  readonly totalEvenements: number;
  readonly projections: readonly ConfigurationBulletinsProjection[];
}
