import type { ConfigurationContext } from '../../context';

// Ce fichier declare les types partages du pont Auth vers Configuration.

export interface ConfigurationAuthContexteActif {
  readonly utilisateurId: string;
  readonly acteurId: string;
  readonly sessionId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly estSuperAdmin: boolean;
}

export interface ConfigurationAuthDemandeAutorisation {
  readonly action: string;
  readonly utilisateurId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConfigurationAuthEvenement {
  readonly type: 'SESSION_SYNC' | 'PERMISSIONS_SYNC';
  readonly utilisateurId: string;
  readonly sessionId?: string;
  readonly actionsAutorisees?: readonly string[];
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly estSuperAdmin?: boolean;
}

export interface ConfigurationAuthSnapshot {
  readonly totalContextes: number;
  readonly contextes: readonly ConfigurationAuthContexteActif[];
}

export interface ConfigurationAuthPreferenceProjection {
  readonly utilisateurId?: string;
  readonly sessionId?: string;
  readonly configurationContext: ConfigurationContext;
}
