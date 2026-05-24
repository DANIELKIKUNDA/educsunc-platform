export interface AuthAuditSecurityAction {
  readonly action: string;
  readonly utilisateurId?: string;
  readonly succes: boolean;
  readonly details?: Record<string, unknown>;
}

export interface AuthAuditConnectionEvent {
  readonly utilisateurId: string;
  readonly sessionId: string;
  readonly organisationActiveId?: string;
  readonly ecoleActiveId?: string;
  readonly estOffline: boolean;
  readonly deviceId?: string;
  readonly adresseIp?: string;
  readonly userAgent?: string;
}

export interface AuthAuditFailureEvent {
  readonly email?: string;
  readonly utilisateurId?: string;
  readonly raison: string;
  readonly sessionId?: string;
  readonly organisationActiveId?: string;
  readonly ecoleActiveId?: string;
  readonly deviceId?: string;
  readonly adresseIp?: string;
  readonly userAgent?: string;
}
