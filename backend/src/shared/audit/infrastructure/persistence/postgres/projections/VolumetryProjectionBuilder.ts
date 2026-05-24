import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditPartitionStatisticsReadModel } from '../../../../application/read-models/volumetrie/AuditPartitionStatisticsReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { calculerFenetrePartitionMensuelle } from '../partitions';
import { auditEntriesPartitionDefinition } from '../partitions/audit-entries.partitions';
import { enrichirProjection, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class VolumetryProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<AuditPartitionStatisticsReadModel> {
    const vue = obtenirVueProjection(entree);
    const fenetre = calculerFenetrePartitionMensuelle(auditEntriesPartitionDefinition, vue.dateAction);
    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.VOLUMETRIE, {
      partition: fenetre.nomPartition,
      total: 1,
    });
  }
}

