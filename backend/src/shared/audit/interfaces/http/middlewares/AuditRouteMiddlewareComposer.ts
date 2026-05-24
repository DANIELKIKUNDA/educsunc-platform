import type { AuditRouteMiddlewareSet } from '../routes/DependancesRoutesAudit';
import { AuditAuthMiddleware } from './auth/AuditAuthMiddleware';
import { AuditContextMiddleware } from './context/AuditContextMiddleware';
import { AuditErrorMiddleware } from './errors/AuditErrorMiddleware';
import { AuditExportsMiddleware } from './exports/AuditExportsMiddleware';
import { AuditForensicMiddleware } from './forensic/AuditForensicMiddleware';
import { AuditMonitoringMiddleware } from './monitoring/AuditMonitoringMiddleware';
import { AuditObservabilityMiddleware } from './observability/AuditObservabilityMiddleware';
import { AuditPermissionMiddleware } from './permissions/AuditPermissionMiddleware';
import { AuditReplayMiddleware } from './replay/AuditReplayMiddleware';
import { AuditRetryMiddleware } from './retry/AuditRetryMiddleware';
import { AuditSecurityMiddleware } from './security/AuditSecurityMiddleware';
import { AuditSynchronizationMiddleware } from './synchronization/AuditSynchronizationMiddleware';
import { AuditTenantMiddleware } from './tenancy/AuditTenantMiddleware';
import { AuditThrottlingMiddleware } from './throttling/AuditThrottlingMiddleware';
import { DeviceMiddleware } from './device/DeviceMiddleware';
import { CorrelationMiddleware } from './tracing/CorrelationMiddleware';
import { RequestIdMiddleware } from './tracing/RequestIdMiddleware';
import { AuditValidationMiddleware } from './validation/AuditValidationMiddleware';

// Ce composite expose le pipeline officiel des middlewares Audit aux routes Fastify.
export class AuditRouteMiddlewareComposer {
  constructor(
    private readonly requestIdMiddleware = new RequestIdMiddleware(),
    private readonly correlationMiddleware = new CorrelationMiddleware(),
    private readonly observabilityMiddleware = new AuditObservabilityMiddleware(),
    private readonly authMiddleware = new AuditAuthMiddleware(),
    private readonly tenantMiddleware = new AuditTenantMiddleware(),
    private readonly deviceMiddleware = new DeviceMiddleware(),
    private readonly permissionMiddleware = new AuditPermissionMiddleware(),
    private readonly validationMiddleware = new AuditValidationMiddleware(),
    private readonly auditContextMiddleware = new AuditContextMiddleware(),
    private readonly forensicMiddleware = new AuditForensicMiddleware(),
    private readonly replayMiddleware = new AuditReplayMiddleware(),
    private readonly retryMiddleware = new AuditRetryMiddleware(),
    private readonly synchronizationMiddleware = new AuditSynchronizationMiddleware(),
    private readonly exportsMiddleware = new AuditExportsMiddleware(),
    private readonly throttlingMiddleware = new AuditThrottlingMiddleware(),
    private readonly monitoringMiddleware = new AuditMonitoringMiddleware(),
    private readonly errorMiddleware = new AuditErrorMiddleware(),
    private readonly securityMiddleware = new AuditSecurityMiddleware(),
  ) {}

  public composer(): AuditRouteMiddlewareSet {
    return {
      requestId: (requete) => {
        this.requestIdMiddleware.appliquer(requete);
      },
      correlation: (requete) => {
        this.correlationMiddleware.appliquer(requete);
      },
      observability: (requete) => this.observabilityMiddleware.observer(requete),
      auth: (requete) => this.authMiddleware.verifier(requete),
      tenant: (requete) => this.tenantMiddleware.verifier(requete),
      security: (requete) => this.securityMiddleware.verifier(requete),
      device: (requete) => {
        this.deviceMiddleware.appliquer(requete);
      },
      verifierPermission: (permission, requete) =>
        this.permissionMiddleware.verifierPermission(requete, permission),
      verifierScope: (scope, requete) => this.permissionMiddleware.verifierScope(requete, scope),
      auditContext: (requete) => this.auditContextMiddleware.injecter(requete),
      validation: (requete) => this.validationMiddleware.verifier(requete),
      forensic: (requete) => this.forensicMiddleware.verifier(requete),
      replay: (requete) => this.replayMiddleware.verifier(requete),
      retry: (requete) => this.retryMiddleware.verifier(requete),
      synchronization: (requete) => this.synchronizationMiddleware.verifier(requete),
      exports: (requete) => this.exportsMiddleware.verifier(requete),
      throttling: (requete) => this.throttlingMiddleware.verifier(requete),
      monitoring: (requete) => this.monitoringMiddleware.preparer(requete),
      apresSucces: (requete, reponse) => this.monitoringMiddleware.surSucces(requete, reponse),
      apresErreur: (requete, reponse) => this.monitoringMiddleware.surErreur(requete, reponse),
      gererErreur: (erreur, requete) => this.errorMiddleware.normaliser(erreur, requete),
    };
  }
}
