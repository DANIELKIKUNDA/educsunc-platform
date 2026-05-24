export type AuditSecuritySurface =
  | 'AUTH'
  | 'FORENSIC'
  | 'REPLAY'
  | 'RETRY'
  | 'SYNCHRONIZATION'
  | 'EXPORTS'
  | 'MONITORING'
  | 'WORKERS'
  | 'QUEUES'
  | 'INCIDENTS'
  | 'ANOMALIES'
  | 'RETENTION'
  | 'RUNTIME';

export interface AuditInterfaceAuthenticationPolicy {
  readonly obligatoire: boolean;
  readonly verifierJwt: boolean;
  readonly verifierSession: boolean;
  readonly verifierRevocation: boolean;
  readonly verifierContexteActif: boolean;
  readonly verifierEtatCompte: boolean;
  readonly verifierTenantActif: boolean;
}

export interface AuditInterfaceAuthorizationPolicy {
  readonly permissions: readonly string[];
  readonly scopes: readonly string[];
  readonly rolesAutorises?: readonly string[];
  readonly restreindreTenant: boolean;
}

export interface AuditInterfaceThrottlingPolicy {
  readonly cle: string;
  readonly limite: number;
  readonly fenetreMs: number;
  readonly criticite: 'NORMALE' | 'ELEVEE' | 'CRITIQUE';
}

export interface AuditInterfaceValidationPolicy {
  readonly verifierPayload: boolean;
  readonly verifierHeaders: boolean;
  readonly verifierQuery: boolean;
  readonly verifierPathParams: boolean;
  readonly exigerJson: boolean;
}

export interface AuditInterfaceMaskingPolicy {
  readonly masquerCorps: boolean;
  readonly masquerHeaders: readonly string[];
  readonly masquerChamps: readonly string[];
}

export interface AuditInterfaceObservabilityPolicy {
  readonly journaliserRefus: boolean;
  readonly propagerRequestId: boolean;
  readonly propagerCorrelationId: boolean;
  readonly propagerTenant: boolean;
  readonly propagerDeviceId: boolean;
}

export interface AuditInterfaceHeaderPolicy {
  readonly requis: readonly string[];
  readonly propages: readonly string[];
  readonly sensibles: readonly string[];
}

export interface AuditInterfaceRuntimeSecurityPolicy {
  readonly protegerAppendOnly: boolean;
  readonly interdireMutationHistorique: boolean;
  readonly surveillerStorms: boolean;
  readonly exigerScopesGranulaires: boolean;
}

