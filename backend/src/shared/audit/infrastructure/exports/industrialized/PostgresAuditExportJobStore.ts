import type { SqlQueryClient } from '../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export type AuditExportJobStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' | 'DELETED';

export interface AuditExportJob {
  readonly idExport: string;
  readonly requesterId?: string;
  readonly scope: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly format: 'CSV' | 'JSON' | 'PDF';
  readonly statut: AuditExportJobStatus;
  readonly filtres: Record<string, unknown>;
  readonly fileKey?: string;
  readonly fileName?: string;
  readonly mimeType?: string;
  readonly tailleOctets?: number;
  readonly nombreElements: number;
  readonly tentativeCount: number;
  readonly erreur?: string;
  readonly expireLe: string;
  readonly demandeLe: string;
}

interface AuditExportJobRow {
  id_export: string;
  requester_id: string | null;
  scope: AuditExportJob['scope'];
  organisation_id: string | null;
  ecole_id: string | null;
  format: AuditExportJob['format'];
  statut: AuditExportJobStatus;
  filtres: Record<string, unknown> | string;
  file_key: string | null;
  file_name: string | null;
  mime_type: string | null;
  taille_octets: string | number | null;
  nombre_elements: number | null;
  tentative_count: number;
  erreur: string | null;
  expire_le: string | Date;
  demande_le: string | Date;
}

export class PostgresAuditExportJobStore {
  public constructor(private readonly sql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async creer(input: {
    idExport: string;
    requesterId?: string;
    scope: AuditExportJob['scope'];
    organisationId?: string;
    ecoleId?: string;
    format: AuditExportJob['format'];
    filtres: Record<string, unknown>;
    idempotencyKey: string;
    requestId?: string;
    correlationId?: string;
    expireLe: Date;
  }): Promise<AuditExportJob> {
    const resultat = await this.sql.executer<AuditExportJobRow>(
      `INSERT INTO audit_export_jobs(
         id_export,requester_id,scope,organisation_id,ecole_id,format,statut,filtres,
         idempotency_key,request_id,correlation_id,expire_le
       ) VALUES ($1,$2,$3,$4,$5,$6,'REQUESTED',$7::jsonb,$8,$9,$10,$11)
       ON CONFLICT (idempotency_key) DO UPDATE SET modifie_le=audit_export_jobs.modifie_le
       RETURNING *`,
      [input.idExport, input.requesterId ?? null, input.scope, input.organisationId ?? null,
        input.ecoleId ?? null, input.format, JSON.stringify(input.filtres), input.idempotencyKey,
        input.requestId ?? null, input.correlationId ?? null, input.expireLe.toISOString()],
    );
    return this.mapper(resultat.lignes[0]);
  }

  public async reprendreTravauxInterrompus(): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_export_jobs SET statut=CASE WHEN file_key IS NOT NULL THEN 'COMPLETED' ELSE 'REQUESTED' END,
         commence_le=CASE WHEN file_key IS NOT NULL THEN commence_le ELSE NULL END,
         termine_le=CASE WHEN file_key IS NOT NULL THEN COALESCE(termine_le,NOW()) ELSE termine_le END,
         modifie_le=NOW()
       WHERE statut='PROCESSING' AND commence_le < NOW() - INTERVAL '15 minutes'`,
    );
  }

  public async compterActifs(requesterId?: string): Promise<{ utilisateur: number; global: number }> {
    const resultat = await this.sql.executer<{ utilisateur: string; global: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE requester_id=$1)::text AS utilisateur,
         COUNT(*)::text AS global
       FROM audit_export_jobs WHERE statut IN ('REQUESTED','PROCESSING') AND expire_le>NOW()`,
      [requesterId ?? null],
    );
    return { utilisateur: Number(resultat.lignes[0]?.utilisateur ?? 0), global: Number(resultat.lignes[0]?.global ?? 0) };
  }

  public async reclamerSuivant(): Promise<AuditExportJob | null> {
    const resultat = await this.sql.executer<AuditExportJobRow>(
      `WITH prochain AS (
         SELECT id_export FROM audit_export_jobs
         WHERE statut='REQUESTED' AND expire_le>NOW()
         ORDER BY demande_le,id_export FOR UPDATE SKIP LOCKED LIMIT 1
       )
       UPDATE audit_export_jobs j SET statut='PROCESSING',commence_le=NOW(),
         tentative_count=tentative_count+1,modifie_le=NOW()
       FROM prochain WHERE j.id_export=prochain.id_export RETURNING j.*`,
    );
    return resultat.lignes[0] ? this.mapper(resultat.lignes[0]) : null;
  }

  public async terminer(idExport: string, fichier: {
    fileKey: string;
    fileName: string;
    mimeType: string;
    tailleOctets: number;
    nombreElements: number;
    checksum: string;
  }): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_export_jobs SET statut='COMPLETED',file_key=$2,file_name=$3,mime_type=$4,
       taille_octets=$5,nombre_elements=$6,checksum_sha256=$7,erreur=NULL,termine_le=NOW(),modifie_le=NOW()
       WHERE id_export=$1 AND statut='PROCESSING'`,
      [idExport, fichier.fileKey, fichier.fileName, fichier.mimeType, fichier.tailleOctets,
        fichier.nombreElements, fichier.checksum],
    );
  }

  public async echouer(idExport: string, erreur: string): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_export_jobs SET statut='FAILED',erreur=$2,termine_le=NOW(),modifie_le=NOW()
       WHERE id_export=$1 AND statut='PROCESSING'`,
      [idExport, erreur.slice(0, 500)],
    );
  }

  public async reessayer(idExport: string, erreur: string): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_export_jobs SET statut='REQUESTED',erreur=$2,commence_le=NULL,modifie_le=NOW()
       WHERE id_export=$1 AND statut='PROCESSING' AND tentative_count<3`,
      [idExport, erreur.slice(0, 500)],
    );
  }

  public async lireAutorise(idExport: string, contexte: {
    requesterId?: string;
    scope: AuditExportJob['scope'];
    organisationId?: string;
    ecoleId?: string;
  }): Promise<AuditExportJob | null> {
    const clauses = ['id_export=$1', "statut<>'DELETED'"];
    const valeurs: unknown[] = [idExport];
    if (contexte.requesterId) {
      valeurs.push(contexte.requesterId);
      clauses.push(`requester_id=$${valeurs.length}`);
    }
    if (contexte.scope !== 'PLATEFORME') {
      valeurs.push(contexte.organisationId ?? null);
      clauses.push(`organisation_id=$${valeurs.length}`);
    }
    if (contexte.scope === 'ECOLE') {
      valeurs.push(contexte.ecoleId ?? null);
      clauses.push(`ecole_id=$${valeurs.length}`);
    }
    const resultat = await this.sql.executer<AuditExportJobRow>(
      `SELECT * FROM audit_export_jobs WHERE ${clauses.join(' AND ')} LIMIT 1`, valeurs,
    );
    return resultat.lignes[0] ? this.mapper(resultat.lignes[0]) : null;
  }

  public async marquerExpire(idExport: string): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_export_jobs SET statut='EXPIRED',modifie_le=NOW()
       WHERE id_export=$1 AND statut='COMPLETED'`, [idExport],
    );
  }

  public async marquerSupprime(idExport: string): Promise<void> {
    await this.sql.executer(
      `UPDATE audit_export_jobs SET statut='DELETED',file_key=NULL,modifie_le=NOW()
       WHERE id_export=$1`, [idExport],
    );
  }

  private mapper(ligne: AuditExportJobRow | undefined): AuditExportJob {
    if (!ligne) throw new Error("Le travail d'export n'a pas pu etre relu.");
    const filtres = typeof ligne.filtres === 'string' ? JSON.parse(ligne.filtres) as Record<string, unknown> : ligne.filtres;
    const iso = (value: string | Date) => value instanceof Date ? value.toISOString() : new Date(value).toISOString();
    return {
      idExport: ligne.id_export,
      requesterId: ligne.requester_id ?? undefined,
      scope: ligne.scope,
      organisationId: ligne.organisation_id ?? undefined,
      ecoleId: ligne.ecole_id ?? undefined,
      format: ligne.format,
      statut: ligne.statut,
      filtres,
      fileKey: ligne.file_key ?? undefined,
      fileName: ligne.file_name ?? undefined,
      mimeType: ligne.mime_type ?? undefined,
      tailleOctets: ligne.taille_octets === null ? undefined : Number(ligne.taille_octets),
      nombreElements: Number(ligne.nombre_elements ?? 0),
      tentativeCount: Number(ligne.tentative_count ?? 0),
      erreur: ligne.erreur ?? undefined,
      expireLe: iso(ligne.expire_le),
      demandeLe: iso(ligne.demande_le),
    };
  }
}
