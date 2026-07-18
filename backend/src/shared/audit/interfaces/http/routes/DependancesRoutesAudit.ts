import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type {
  AuditAnalyticsController,
  AuditController,
  AuditExportsController,
  AuditForensicController,
  AuditHealthController,
  AuditMonitoringController,
  AuditReplayController,
  AuditRetentionController,
  AuditRetryController,
  AuditSecurityController,
  AuditSynchronizationController,
} from '../controllers';
import type { AuditMetricPoint } from '../../../infrastructure/monitoring/MonitoringTypes';

export interface AuditRouteMiddlewareSet {
  onRequest?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  requestId?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  correlation?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  auth?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  tenant?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  observability?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  security?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  device?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  validation?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  auditContext?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  throttling?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  forensic?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  replay?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  retry?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  synchronization?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  exports?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  monitoring?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierPermission?(
    permission: string,
    requete: FastifyRequest,
    reponse: FastifyReply,
  ): Promise<void> | void;
  verifierScope?(scope: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierInterne?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierAdmin?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  apresSucces?(requete: FastifyRequest, reponse: FastifyReply, resultat: unknown): Promise<void> | void;
  apresErreur?(requete: FastifyRequest, reponse: FastifyReply, erreur: unknown): Promise<void> | void;
  gererErreur?(
    erreur: unknown,
    requete: FastifyRequest,
    reponse: FastifyReply,
  ): Promise<{ statutHttp: number; corps: unknown } | void> | { statutHttp: number; corps: unknown } | void;
}

export interface DependancesRoutesAudit {
  auditController: AuditController;
  auditForensicController: AuditForensicController;
  auditExportsController: AuditExportsController;
  auditReplayController: AuditReplayController;
  auditRetryController: AuditRetryController;
  auditSynchronizationController: AuditSynchronizationController;
  auditMonitoringController: AuditMonitoringController;
  auditAnalyticsController: AuditAnalyticsController;
  auditRetentionController: AuditRetentionController;
  auditSecurityController: AuditSecurityController;
  auditHealthController: AuditHealthController;
  auditSchoolTechnicalMetricsService?: {
    collecter(filtres: { organisationId: string; ecoleId: string }): Promise<AuditMetricPoint[]>;
  };
  middlewares?: AuditRouteMiddlewareSet;
}

export type FabriqueRoutesAudit = (dependances: DependancesRoutesAudit) => FastifyPluginAsync;
