import type { FastifyPluginAsync } from 'fastify';
import type { DependancesRoutesAudit } from './DependancesRoutesAudit';
import { appliquerPoliciesRouteAudit, executerRouteAudit } from './_route-helpers';
import { envelopperReponse, extraireContexteRuntime } from '../controllers/AuditControllerSupport';
import { AuditMonitoringPresenter } from '../presenters/AuditMonitoringPresenter';
import { AuditTraceService } from '../../../infrastructure/monitoring/traces/AuditTraceService';
import { AuditSchoolTechnicalMetricsService } from '../../../infrastructure/monitoring/ecole/AuditSchoolTechnicalMetricsService';

const FILTRE_AUDIT_ECOLE = {
  categorieAudit: 'FINANCIER',
} as const;

const auditTraceService = new AuditTraceService();
const auditSchoolTechnicalMetricsService = new AuditSchoolTechnicalMetricsService(auditTraceService);

// Ces routes ouvrent l'audit administratif et financier borne a l'ecole active.
export const creerEcoleAuditRoutes = (
  dependances: DependancesRoutesAudit,
): FastifyPluginAsync => async (serveur) => {
  serveur.get('/api/v1/ecole/audit/administratif-financier', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.finance.read',
        scope: 'ECOLE',
      });
      return dependances.auditController.lister({
        query: { ...(requete.query as Record<string, unknown>), ...FILTRE_AUDIT_ECOLE } as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ECOLE',
      });
    }));

  serveur.get('/api/v1/ecole/audit/administratif-financier/history', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.finance.read',
        scope: 'ECOLE',
      });
      return dependances.auditController.obtenirHistorique({
        query: { ...(requete.query as Record<string, unknown>), ...FILTRE_AUDIT_ECOLE } as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ECOLE',
      });
    }));

  serveur.get('/api/v1/ecole/audit/administratif-financier/timeline', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.finance.read',
        scope: 'ECOLE',
      });
      return dependances.auditController.obtenirTimeline({
        query: { ...(requete.query as Record<string, unknown>), ...FILTRE_AUDIT_ECOLE } as never,
        headers: requete.headers,
        context: requete.context,
        authorizedScope: 'ECOLE',
      });
    }));

  serveur.get('/api/v1/ecole/audit/technique/traces', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.technical.read',
        scope: 'ECOLE',
      });

      const contexte = extraireContexteRuntime({ headers: requete.headers, context: requete.context } as never);
      const startedAt = Date.now();
      const traces = auditTraceService.lister({
        organisationId: contexte.organisationId,
        ecoleId: contexte.ecoleId,
      });

      return envelopperReponse(AuditMonitoringPresenter.presenter({ traces }), contexte, startedAt);
    }));

  serveur.get('/api/v1/ecole/audit/technique/metrics', (requete, reponse) =>
    executerRouteAudit(dependances, requete, reponse, async () => {
      await appliquerPoliciesRouteAudit(dependances, requete, reponse, {
        permission: 'audit.technical.read',
        scope: 'ECOLE',
      });

      const contexte = extraireContexteRuntime({ headers: requete.headers, context: requete.context } as never);
      const startedAt = Date.now();
      const metricsService = dependances.auditSchoolTechnicalMetricsService
        ?? auditSchoolTechnicalMetricsService;
      const metrics = contexte.organisationId && contexte.ecoleId
        ? await metricsService.collecter({
          organisationId: contexte.organisationId,
          ecoleId: contexte.ecoleId,
        })
        : [];

      return envelopperReponse(AuditMonitoringPresenter.presenter({ metrics }), contexte, startedAt);
    }));
};
