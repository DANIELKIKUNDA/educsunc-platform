export interface MonitoringApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

export interface MonitoringMutationPayload {
  [key: string]: unknown;
}

export type MonitoringOverviewMode = 'state' | 'dashboard' | 'observability' | 'health';
