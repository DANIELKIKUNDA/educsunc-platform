import { AuditCorrelation, AuditExecutionContext, AuditMetadata, ContexteAudit } from '../../../../domain/entities';
import { TYPE_EXECUTION_AUDIT_ENUM } from '../../../../domain/enums';
import type { TypeExecutionAuditEnum } from '../../../../domain/enums';
import { CorrelationId, RequestId, SourceAudit } from '../../../../domain/value-objects';
import type { AuditEntryRow } from './AuditPersistenceRecords';
import { AuditJsonbMapper } from './AuditJsonbMapper';

export interface AuditContextFragments {
  contexteAudit: ContexteAudit;
  auditCorrelation?: AuditCorrelation;
  auditMetadata?: AuditMetadata;
  auditExecutionContext?: AuditExecutionContext;
}

// Ce mapper reconstruit le contexte runtime complet a partir des colonnes critiques.
export class AuditContextPersistenceMapper {
  public static versColonnes(entree: {
    idAuditEntry: string;
    contexteAudit: ContexteAudit;
    auditCorrelation?: AuditCorrelation;
    auditMetadata?: AuditMetadata;
    auditExecutionContext?: AuditExecutionContext;
  }): Pick<
    AuditEntryRow,
    | 'request_id'
    | 'correlation_id'
    | 'session_id'
    | 'adresse_ip'
    | 'user_agent'
    | 'device_id'
    | 'source_audit'
    | 'source_runtime'
    | 'version_application'
    | 'contexte_execution'
    | 'metadata'
  > {
    const sourceRuntime = entree.contexteAudit.obtenirSourceRuntime().obtenirValeur();
    const metadata = {
      ...(entree.auditMetadata?.obtenirMetadataAdditionnelle() ?? {}),
      sourceAuditOriginal: entree.auditMetadata?.obtenirMetadataAdditionnelle().sourceAuditOriginal ?? sourceRuntime,
      versionApi: entree.auditMetadata?.obtenirVersionApi(),
      versionFrontend: entree.auditMetadata?.obtenirVersionFrontend(),
      versionMobile: entree.auditMetadata?.obtenirVersionMobile(),
      build: entree.auditMetadata?.obtenirBuild(),
      region: entree.auditMetadata?.obtenirRegion(),
      runtime: entree.auditMetadata?.obtenirRuntime(),
      langue: entree.auditMetadata?.obtenirLangue(),
      canal: entree.auditMetadata?.obtenirCanal(),
      correlationWorkflowId: entree.auditCorrelation?.obtenirWorkflowId(),
      correlationOperationGlobale: entree.auditCorrelation?.obtenirOperationGlobale(),
    };

    return {
      request_id: entree.contexteAudit.obtenirRequestId()?.obtenirValeur() ?? null,
      correlation_id: entree.auditCorrelation?.obtenirCorrelationId()?.obtenirValeur()
        ?? entree.contexteAudit.obtenirCorrelationId()?.obtenirValeur()
        ?? null,
      session_id: entree.contexteAudit.obtenirSessionId() ?? null,
      adresse_ip: entree.contexteAudit.obtenirAdresseIp() ?? null,
      user_agent: entree.contexteAudit.obtenirUserAgent() ?? null,
      device_id: entree.contexteAudit.obtenirDeviceId() ?? null,
      source_audit: String(metadata.sourceAuditOriginal ?? sourceRuntime),
      source_runtime: sourceRuntime,
      version_application: entree.contexteAudit.obtenirVersionApplication()
        ?? entree.auditMetadata?.obtenirVersionFrontend()
        ?? entree.auditMetadata?.obtenirVersionMobile()
        ?? null,
      contexte_execution: AuditJsonbMapper.serialiser({
        modeExecution: entree.auditExecutionContext?.obtenirModeExecution(),
        batchId: entree.auditExecutionContext?.obtenirBatchId(),
        retryCount: entree.auditExecutionContext?.obtenirRetryCount(),
        origineExecution: entree.auditExecutionContext?.obtenirOrigineExecution(),
        queueId: entree.auditExecutionContext?.obtenirQueueId(),
      }),
      metadata: AuditJsonbMapper.serialiser(metadata),
    };
  }

  public static depuisColonnes(row: Pick<
    AuditEntryRow,
    | 'id_audit_entry'
    | 'request_id'
    | 'correlation_id'
    | 'session_id'
    | 'adresse_ip'
    | 'user_agent'
    | 'device_id'
    | 'source_audit'
    | 'source_runtime'
    | 'version_application'
    | 'metadata'
    | 'contexte_execution'
  >): AuditContextFragments {
    const metadata = AuditJsonbMapper.deserialiserObjet(row.metadata) ?? {};
    const execution = AuditJsonbMapper.deserialiserObjet(row.contexte_execution) ?? {};
    const contexteAudit = new ContexteAudit({
      idContexteAudit: `${row.id_audit_entry}-context`,
      requestId: new RequestId(row.request_id),
      correlationId: new CorrelationId(row.correlation_id),
      sessionId: row.session_id ?? undefined,
      adresseIp: row.adresse_ip ?? undefined,
      userAgent: row.user_agent ?? undefined,
      deviceId: row.device_id ?? undefined,
      modeOffline: Boolean(metadata.modeOffline ?? false),
      sourceRuntime: new SourceAudit(row.source_runtime ?? row.source_audit),
      versionApplication: row.version_application ?? undefined,
      versionApi: typeof metadata.versionApi === 'string' ? metadata.versionApi : undefined,
      plateforme: typeof metadata.runtime === 'string' ? metadata.runtime : undefined,
      environnement: typeof metadata.region === 'string' ? metadata.region : undefined,
    });

    const auditCorrelation = row.correlation_id
      ? new AuditCorrelation({
        idAuditCorrelation: `${row.id_audit_entry}-correlation`,
        correlationId: new CorrelationId(row.correlation_id),
        workflowId: typeof metadata.correlationWorkflowId === 'string' ? metadata.correlationWorkflowId : undefined,
        operationGlobale: typeof metadata.correlationOperationGlobale === 'string' ? metadata.correlationOperationGlobale : undefined,
      })
      : undefined;

    const auditMetadata = new AuditMetadata({
      idAuditMetadata: `${row.id_audit_entry}-metadata`,
      versionApi: typeof metadata.versionApi === 'string' ? metadata.versionApi : undefined,
      versionFrontend: typeof metadata.versionFrontend === 'string' ? metadata.versionFrontend : undefined,
      versionMobile: typeof metadata.versionMobile === 'string' ? metadata.versionMobile : undefined,
      build: typeof metadata.build === 'string' ? metadata.build : undefined,
      region: typeof metadata.region === 'string' ? metadata.region : undefined,
      runtime: typeof metadata.runtime === 'string' ? metadata.runtime : undefined,
      langue: typeof metadata.langue === 'string' ? metadata.langue : undefined,
      canal: typeof metadata.canal === 'string' ? metadata.canal : undefined,
      metadataAdditionnelle: metadata,
    });

    const modeExecution: TypeExecutionAuditEnum | undefined = typeof execution.modeExecution === 'string'
      && TYPE_EXECUTION_AUDIT_ENUM.includes(execution.modeExecution as (typeof TYPE_EXECUTION_AUDIT_ENUM)[number])
      ? (execution.modeExecution as TypeExecutionAuditEnum)
      : undefined;

    const auditExecutionContext = modeExecution
      ? new AuditExecutionContext({
        idAuditExecutionContext: `${row.id_audit_entry}-execution`,
        modeExecution,
        batchId: typeof execution.batchId === 'string' ? execution.batchId : undefined,
        retryCount: typeof execution.retryCount === 'number' ? execution.retryCount : 0,
        origineExecution: typeof execution.origineExecution === 'string' ? execution.origineExecution : 'SYNCHRONE',
        queueId: typeof execution.queueId === 'string' ? execution.queueId : undefined,
      })
      : undefined;

    return {
      contexteAudit,
      auditCorrelation,
      auditMetadata,
      auditExecutionContext,
    };
  }
}
