export interface MonitoringApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface MonitoringMutationPayload {
  [key: string]: unknown;
}

export type MonitoringOverviewMode = 'state' | 'dashboard' | 'observability' | 'health';

export const monitoringActors = ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'] as const;
