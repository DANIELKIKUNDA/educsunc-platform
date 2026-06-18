// Ce fichier declare les types d integration Security pour Monitoring.

export interface MonitoringSecurityEvenement {
  readonly type: string;
  readonly correlationId: string;
  readonly gravite: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly chargeUtile: Record<string, unknown>;
  readonly survenanceLe: Date;
}

export interface MonitoringSecurityDecision {
  readonly autorise: boolean;
  readonly raison?: string;
}
