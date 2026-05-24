import type { CreateOfflineAuditEntryInput } from '../dto/inputs/CreateOfflineAuditEntryInput';
import type { OfflineAuditReplayInput } from '../dto/offline/OfflineAuditReplayInput';
import type { OfflineAuditConflictInput } from '../dto/offline/OfflineAuditConflictInput';
import type { OfflineAuditSyncStatusInput } from '../dto/offline/OfflineAuditSyncStatusInput';
import type { AuditEntryOutput } from '../dto/outputs/AuditEntryOutput';
import type { AuditOfflineStatusOutput } from '../dto/outputs/AuditOfflineStatusOutput';
import { AuditEntryMapper } from '../mappers/AuditEntryMapper';
import { AuditOfflineMapper } from '../mappers/AuditOfflineMapper';

// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditOfflineApplicationService {
  public async creerAuditOffline(payload: CreateOfflineAuditEntryInput): Promise<AuditEntryOutput> {
    return AuditEntryMapper.depuisCreateAuditEntryInput({
      action: 'AUDIT_OFFLINE_CREE',
      typePrincipal: 'OFFLINE',
      resultat: payload.statutSynchronisation,
      categories: ['OFFLINE', 'SYNC'],
      acteur: { typeActeur: 'APPAREIL' },
      contexte: { sourceAudit: 'OFFLINE', modeOffline: true, deviceId: payload.appareil },
      tenant: { scope: 'ECOLE' },
      metadata: { offline: AuditOfflineMapper.depuisOfflineInput(payload), audit: payload.audit },
    });
  }
  public async rejouerAuditOffline(payload: OfflineAuditReplayInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: 0, enConflit: 0, enAttente: 1, auditId: payload.auditId, replay: true, horodatage: new Date().toISOString() };
  }
  public async resoudreConflitAudit(payload: OfflineAuditConflictInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: 1, enConflit: 0, enAttente: 0, auditId: payload.auditId, conflit: false, statutSynchronisation: payload.resolution, horodatage: new Date().toISOString() };
  }
  public async obtenirAuditsNonSynchronises(): Promise<AuditOfflineStatusOutput> {
    return { total: 0, synchronises: 0, enConflit: 0, enAttente: 0, horodatage: new Date().toISOString() };
  }
  public async marquerAuditSynchronise(payload: OfflineAuditSyncStatusInput): Promise<AuditOfflineStatusOutput> {
    return { total: 1, synchronises: payload.statutSynchronisation === 'SYNCED' ? 1 : 0, enConflit: 0, enAttente: payload.statutSynchronisation === 'SYNCED' ? 0 : 1, auditId: payload.auditId, statutSynchronisation: payload.statutSynchronisation, horodatage: new Date().toISOString() };
  }
}
