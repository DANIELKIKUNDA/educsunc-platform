import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditForensicTrace } from '../../../../domain/repositories';
import type { AuditForensicLinkRow } from './AuditPersistenceRecords';
import { AuditEntryPersistenceMapper } from './AuditEntryPersistenceMapper';
import type { ForensicCorrelationReadModel } from '../../../../application/read-models/forensic/ForensicCorrelationReadModel';

// Ce mapper garde la lisibilite d'investigation sur les liens et traces forensic.
export class AuditForensicMapper {
  public static versTrace(entree: AuditEntry, typeRelation?: string): AuditForensicTrace {
    const record = AuditEntryPersistenceMapper.versAuditSearchItem(entree);
    return {
      auditEntry: entree,
      correlationId: record.correlationId,
      requestId: record.contexte.requestId,
      acteurId: record.acteur.idUtilisateur,
      typeRelation,
    };
  }

  public static versLinkRow(sourceId: string, cibleId: string, typeRelation: string, id = 0): AuditForensicLinkRow {
    return {
      id,
      audit_entry_source: sourceId,
      audit_entry_cible: cibleId,
      type_relation: typeRelation,
    };
  }

  public static versCorrelationReadModel(trace: AuditForensicTrace): ForensicCorrelationReadModel {
    return {
      correlationId: trace.correlationId,
      actions: [trace.auditEntry.obtenirActionAudit().obtenirValeur()],
    };
  }
}
