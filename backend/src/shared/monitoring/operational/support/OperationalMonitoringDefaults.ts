import type { MonitoringContextInputDto } from '../../application';

// Ce fichier declare les valeurs par defaut du support operational Monitoring.

export const OPERATIONAL_MONITORING_DEFAULT_CONTEXT: MonitoringContextInputDto = {
  organisationId: 'org-monitoring-operational',
  ecoleId: 'ecole-monitoring-operational',
  utilisateurId: 'system-monitoring-operational',
  module: 'shared-monitoring',
  composant: 'operational-monitoring',
  correlationId: 'corr-monitoring-operational',
};
