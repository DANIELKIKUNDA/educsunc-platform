import type { AuditEntry } from '../../../../domain/aggregates';
import type { OfflineAuditReadModel } from '../../../../application/read-models/offline/OfflineAuditReadModel';
import { AUDIT_PROJECTION_FAMILIES } from './AuditProjectionFamilies';
import { enrichirProjection, estProjectionOffline, obtenirVueProjection, type AuditProjectionEnvelope } from './projection-helpers';

export class OfflineSyncProjectionBuilder {
  public construire(entree: AuditEntry): AuditProjectionEnvelope<OfflineAuditReadModel> | null {
    const vue = obtenirVueProjection(entree);
    if (!estProjectionOffline(vue)) {
      return null;
    }

    return enrichirProjection(entree, AUDIT_PROJECTION_FAMILIES.OFFLINE_SYNC, {
      auditId: vue.idAuditEntry,
      statutSynchronisation: vue.statutSynchronisation ?? 'EN_ATTENTE',
      replay: vue.replay,
      retry: vue.retry,
      conflit: vue.enConflit,
    });
  }
}

