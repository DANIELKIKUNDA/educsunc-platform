import { randomUUID } from 'node:crypto';
import { ActeurAudit, AuditExecutionContext, ContexteAudit, TenantAudit } from '../entities';
import type { TypeActeurAuditEnum, TypeExecutionAuditEnum } from '../enums';
import { CorrelationId, RequestId, SourceAudit, TenantAuditScope } from '../value-objects';

// Ce moteur enrichit l'audit avec le contexte réel d'exécution et de tenancy.
export class MoteurContextualisationAudit {
  public construireActeur(params: {
    typeActeur: TypeActeurAuditEnum;
    idUtilisateur?: string;
    nomUtilisateur?: string;
    emailUtilisateur?: string;
    roleActif?: string;
    sourceActeur: string;
  }): ActeurAudit {
    return new ActeurAudit({ idActeurAudit: randomUUID(), ...params });
  }

  public construireContexte(params: {
    requestId?: string;
    correlationId?: string;
    sessionId?: string;
    userAgent?: string;
    adresseIp?: string;
    deviceId?: string;
    modeOffline: boolean;
    sourceRuntime: string;
    versionApplication?: string;
    versionApi?: string;
    plateforme?: string;
    environnement?: string;
  }): ContexteAudit {
    return new ContexteAudit({
      idContexteAudit: randomUUID(),
      requestId: new RequestId(params.requestId),
      correlationId: new CorrelationId(params.correlationId),
      sessionId: params.sessionId,
      userAgent: params.userAgent,
      adresseIp: params.adresseIp,
      deviceId: params.deviceId,
      modeOffline: params.modeOffline,
      sourceRuntime: new SourceAudit(params.sourceRuntime),
      versionApplication: params.versionApplication,
      versionApi: params.versionApi,
      plateforme: params.plateforme,
      environnement: params.environnement,
    });
  }

  public construireTenant(params: {
    scope: string;
    organisationId?: string;
    ecoleId?: string;
    scopeActif?: string;
  }): TenantAudit {
    return new TenantAudit({
      idTenantAudit: randomUUID(),
      scope: new TenantAuditScope(params.scope),
      organisationId: params.organisationId,
      ecoleId: params.ecoleId,
      scopeActif: params.scopeActif,
    });
  }

  // Cette methode construit le contexte d'execution officiel pour le forensic et le runtime.
  public construireExecutionContext(params: {
    modeExecution: TypeExecutionAuditEnum;
    batchId?: string;
    retryCount?: number;
    origineExecution: string;
    queueId?: string;
  }): AuditExecutionContext {
    return new AuditExecutionContext({
      idAuditExecutionContext: randomUUID(),
      modeExecution: params.modeExecution,
      batchId: params.batchId,
      retryCount: params.retryCount,
      origineExecution: params.origineExecution,
      queueId: params.queueId,
    });
  }
}
