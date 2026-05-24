import { randomUUID } from 'node:crypto';
import type { AuditEntry } from '../../../../../domain/aggregates';
import type { AuditArchiveRecord } from '../../../../../domain/repositories';
import { construireVueAudit } from '../../repositories/audit-repository.helpers';
import type { AuditColdStoragePackage } from '../AuditColdStorageTypes';
import { PostgresAuditCompressionService } from '../compression/PostgresAuditCompressionService';

// Ce builder preserve les metadonnees tenant, forensic et offline avant envoi vers stockage froid.
export class AuditColdStoragePackageBuilder {
  private readonly compression = new PostgresAuditCompressionService();

  public construire(params: {
    archives: readonly AuditArchiveRecord[];
    entrees: readonly AuditEntry[];
    formatStockage?: AuditColdStoragePackage['formatStockage'];
  }): AuditColdStoragePackage {
    const vues = params.entrees.map((entree) => construireVueAudit(entree));
    const correlationIds = [...new Set(vues.map((vue) => vue.correlationId).filter((valeur): valeur is string => typeof valeur === 'string'))];
    const requestIds = [...new Set(vues.map((vue) => vue.requestId).filter((valeur): valeur is string => typeof valeur === 'string'))];
    const deviceIds = [...new Set(vues.map((vue) => vue.deviceId).filter((valeur): valeur is string => typeof valeur === 'string'))];
    const acteurIds = [...new Set(vues.map((vue) => vue.acteurId).filter((valeur): valeur is string => typeof valeur === 'string'))];
    const ressourcesIds = [...new Set(vues.map((vue) => vue.idRessource).filter((valeur): valeur is string => typeof valeur === 'string'))];
    const organisationId = vues.find((vue) => vue.organisationId)?.organisationId ?? params.archives.find((archive) => archive.organisationId)?.organisationId;
    const ecoleId = vues.find((vue) => vue.ecoleId)?.ecoleId ?? params.archives.find((archive) => archive.ecoleId)?.ecoleId;
    const scope = vues.find((vue) => vue.scope)?.scope;
    const dateActions = vues.map((vue) => vue.dateAction.toISOString()).sort();
    const datesArchivage = params.archives.map((archive) => archive.dateArchivage.toISOString()).sort();

    const partial = {
      packageId: randomUUID(),
      typeArchive: params.archives[0]?.typeArchive ?? 'COLD_STORAGE',
      organisationId,
      ecoleId,
      scope,
      totalArchives: params.archives.length,
      totalAudits: params.entrees.length,
      creeLe: new Date().toISOString(),
      formatStockage: params.formatStockage ?? 'COMPRESSED_ARCHIVE',
      forensic: {
        correlationIds,
        requestIds,
        deviceIds,
        acteurIds,
        ressourcesIds,
        contientReplay: vues.some((vue) => vue.replay),
        contientRetry: vues.some((vue) => vue.retry),
        contientConflit: vues.some((vue) => vue.enConflit),
      },
      chronologie: {
        dateActionMin: dateActions[0],
        dateActionMax: dateActions.at(-1),
        dateArchivageMin: datesArchivage[0],
        dateArchivageMax: datesArchivage.at(-1),
      },
      archives: params.archives,
      auditEntryIds: params.entrees.map((entree) => entree.obtenirId()),
    } as const;

    const { blob, empreinteCompression } = this.compression.compresser(partial);
    return {
      ...partial,
      blob,
      empreinteCompression,
    };
  }
}

