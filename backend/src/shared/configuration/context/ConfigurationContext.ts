export interface ConfigurationContext {
  readonly configurationId: string;
  readonly scopeLevel: 'GLOBAL' | 'ENVIRONNEMENT' | 'ORGANISATION' | 'ECOLE';
  readonly environnement?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly actorId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly replayId?: string;
  readonly retryCount?: number;
  readonly syncId?: string;
  readonly rollbackVersion?: string;
  readonly previousVersion?: string;
  readonly nextVersion?: string;
  readonly changedAt: string;
}
