// Ce fichier declare les types d integration Auth pour Monitoring.

export interface MonitoringAuthEvenement {
  readonly utilisateurId: string;
  readonly sessionId?: string;
  readonly permissions: readonly string[];
  readonly scopes: readonly string[];
  readonly survenanceLe: Date;
}

export interface MonitoringAuthContexteActif {
  readonly utilisateurId: string;
  readonly sessionId?: string;
  readonly permissions: readonly string[];
  readonly scopes: readonly string[];
  readonly estSuperAdmin: boolean;
}

export interface MonitoringAuthDemandeAutorisation {
  readonly utilisateurId: string;
  readonly permission: string;
  readonly scope?: string;
}
