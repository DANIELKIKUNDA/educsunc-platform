import { createHash, randomUUID } from 'node:crypto';
import type {
  AuditExportAccessContext,
  AuditExportDownloadOutput,
  AuditExportOperationsPort,
  AuditExportStatusOutput,
} from '../../../application/ports/exports/AuditExportOperationsPort';
import type { AuditExportQuery } from '../../../application/dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../../../application/dto/outputs/AuditExportOutput';
import { serialiserAuditCanoniquement } from '../../security/integrity/CanonicalAuditSerializer';
import { PrivateAuditExportFileStore } from './PrivateAuditExportFileStore';
import { PostgresAuditExportJobStore } from './PostgresAuditExportJobStore';

export class AuditExportOperationsService implements AuditExportOperationsPort {
  public constructor(
    private readonly travaux = new PostgresAuditExportJobStore(),
    private readonly fichiers = new PrivateAuditExportFileStore(),
    private readonly reveillerWorker: () => void = () => undefined,
    private readonly auditer: (operation: 'EXPORT_DEMANDE' | 'EXPORT_TELECHARGE', payload: AuditExportQuery & { exportId: string }) => Promise<void> = async () => undefined,
  ) {}

  public async demander(payload: AuditExportQuery): Promise<AuditExportOutput> {
    const format = payload.format.toUpperCase();
    if (!['CSV', 'JSON', 'PDF'].includes(format)) throw new Error("Le format d'export demande n'est pas pris en charge.");
    const scope = payload.scope ?? 'ECOLE';
    this.verifierContexte(scope, payload.organisationId, payload.ecoleId);
    if (JSON.stringify(payload.filtres ?? {}).length > 32_768) throw new Error("Les filtres d'export sont trop volumineux.");
    const actifs = await this.travaux.compterActifs(payload.demandeurId);
    if (actifs.utilisateur >= 3 || actifs.global >= 20) {
      throw new Error("Trop d'exports sont deja en cours. Attendez leur fin avant de recommencer.");
    }
    const idExport = randomUUID();
    const maintenant = new Date();
    const expiration = new Date(maintenant.getTime() + Number(process.env.EDUCSYN_AUDIT_EXPORT_TTL_HOURS ?? 24) * 3_600_000);
    const cle = createHash('sha256').update(serialiserAuditCanoniquement({
      requestId: payload.idempotencyKey ?? payload.requestId ?? idExport,
      demandeurId: payload.demandeurId,
      scope,
      organisationId: payload.organisationId,
      ecoleId: payload.ecoleId,
      format,
      categorie: payload.categorieExport,
      filtres: payload.filtres ?? {},
    })).digest('hex');
    const travail = await this.travaux.creer({
      idExport,
      requesterId: payload.demandeurId,
      scope,
      organisationId: scope === 'PLATEFORME' ? undefined : payload.organisationId,
      ecoleId: scope === 'ECOLE' ? payload.ecoleId : undefined,
      format: format as 'CSV' | 'JSON' | 'PDF',
      filtres: { ...(payload.filtres ?? {}), categorieExport: payload.categorieExport },
      idempotencyKey: cle,
      requestId: payload.requestId,
      correlationId: payload.correlationId,
      expireLe: expiration,
    });
    this.reveillerWorker();
    await this.auditerSansCasser('EXPORT_DEMANDE', { ...payload, exportId: travail.idExport });
    return {
      exportId: travail.idExport,
      format: travail.format,
      nombreElements: travail.nombreElements,
      dateGeneration: travail.demandeLe,
      statut: travail.statut,
    };
  }

  public async obtenirStatut(exportId: string, contexte: AuditExportAccessContext): Promise<AuditExportStatusOutput> {
    const travail = await this.travaux.lireAutorise(exportId, contexte);
    if (!travail) throw new Error("Cet export n'existe pas ou n'est pas accessible dans votre perimetre.");
    if (travail.statut === 'COMPLETED' && new Date(travail.expireLe).getTime() <= Date.now()) {
      if (travail.fileKey) await this.fichiers.supprimer(travail.fileKey);
      await this.travaux.marquerExpire(travail.idExport);
      return { exportId, statut: 'EXPIRED', nombreElements: travail.nombreElements, expireLe: travail.expireLe };
    }
    return { exportId, statut: travail.statut, nombreElements: travail.nombreElements, erreur: travail.erreur, expireLe: travail.expireLe };
  }

  public async preparerTelechargement(exportId: string, contexte: AuditExportAccessContext): Promise<AuditExportDownloadOutput> {
    const travail = await this.travaux.lireAutorise(exportId, contexte);
    if (!travail) throw new Error("Cet export n'existe pas ou n'est pas accessible dans votre perimetre.");
    if (new Date(travail.expireLe).getTime() <= Date.now()) {
      if (travail.fileKey) await this.fichiers.supprimer(travail.fileKey);
      await this.travaux.marquerExpire(exportId);
      throw new Error("Cet export a expire. Demandez un nouvel export.");
    }
    if (travail.statut !== 'COMPLETED' || !travail.fileKey || !travail.fileName || !travail.mimeType) {
      throw new Error("Cet export n'est pas encore disponible au telechargement.");
    }
    const fichier = await this.fichiers.ouvrirLecture(travail.fileKey);
    await this.auditerSansCasser('EXPORT_TELECHARGE', {
      format: travail.format, exportId, demandeurId: contexte.demandeurId,
      scope: contexte.scope, organisationId: contexte.organisationId, ecoleId: contexte.ecoleId,
    });
    return { exportId, nomFichier: travail.fileName, mimeType: travail.mimeType, cheminPrive: fichier.chemin, tailleOctets: fichier.taille };
  }

  public async supprimer(exportId: string, contexte: AuditExportAccessContext): Promise<void> {
    const travail = await this.travaux.lireAutorise(exportId, contexte);
    if (!travail) throw new Error("Cet export n'existe pas ou n'est pas accessible dans votre perimetre.");
    if (travail.fileKey) await this.fichiers.supprimer(travail.fileKey);
    await this.travaux.marquerSupprime(exportId);
  }

  private verifierContexte(scope: string, organisationId?: string, ecoleId?: string): void {
    if (scope === 'ORGANISATION' && !organisationId) throw new Error("Le contexte organisation est requis pour cet export.");
    if (scope === 'ECOLE' && (!organisationId || !ecoleId)) throw new Error("Le contexte ecole est requis pour cet export.");
  }

  private async auditerSansCasser(operation: 'EXPORT_DEMANDE' | 'EXPORT_TELECHARGE', payload: AuditExportQuery & { exportId: string }): Promise<void> {
    try {
      await this.auditer(operation, payload);
    } catch {
      // L'operation principale reste valide; l'outbox Audit pourra etre reprise independamment.
    }
  }
}
