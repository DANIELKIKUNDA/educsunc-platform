import type { DependancesRoutesAudit } from '../../interfaces/http/routes';

const reponseNeutre = async () => ({
  donnee: {
    accepte: true,
    elements: [],
  },
  meta: {
    modeOffline: false,
    durationMs: 0,
  },
});

// Les tests de routes valident les policies HTTP sans ouvrir la persistance de production.
export function neutraliserTraitementsAuditPourTest(dependances: DependancesRoutesAudit): void {
  dependances.auditSchoolTechnicalMetricsService = {
    collecter: async () => [
      {
        nom: 'audit_school_traces_total',
        valeur: 1,
        horodatage: new Date(0).toISOString(),
      },
    ],
  };
  Object.assign(dependances.auditController, {
    lister: reponseNeutre,
    consulterParId: reponseNeutre,
    obtenirTimeline: reponseNeutre,
    obtenirHistorique: reponseNeutre,
  });
  Object.assign(dependances.auditMonitoringController, {
    health: reponseNeutre,
    metrics: reponseNeutre,
  });
  Object.assign(dependances.auditAnalyticsController, {
    audit: reponseNeutre,
  });
  Object.assign(dependances.auditSecurityController, {
    incidents: reponseNeutre,
  });
  Object.assign(dependances.auditReplayController, {
    rejouerProjectionsAudit: reponseNeutre,
  });
  Object.assign(dependances.auditSynchronizationController, {
    recupererSynchronisation: reponseNeutre,
  });
  Object.assign(dependances.auditExportsController, {
    exporterAudit: reponseNeutre,
  });
}
