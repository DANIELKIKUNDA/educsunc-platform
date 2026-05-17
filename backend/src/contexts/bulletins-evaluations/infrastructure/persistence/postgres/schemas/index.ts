import { ArchiveBulletinSchema } from './ArchiveBulletinSchema';
import { AuditEncodageSchema } from './AuditEncodageSchema';
import { BulletinSchema } from './BulletinSchema';
import { ClassementSchema } from './ClassementSchema';
import { CoteColonneSchema } from './CoteColonneSchema';
import { FicheCotationSchema } from './FicheCotationSchema';
import { LigneBulletinSchema } from './LigneBulletinSchema';
import { LigneProclamationSchema } from './LigneProclamationSchema';
import { MigrationBulletinSchema } from './MigrationBulletinSchema';
import { OfflineOperationSchema } from './OfflineOperationSchema';
import { ProclamationSchema } from './ProclamationSchema';
import { ResultatBulletinSchema } from './ResultatBulletinSchema';
import { SnapshotBulletinSchema } from './SnapshotBulletinSchema';
import { SyntheseResultatsSchema } from './SyntheseResultatsSchema';

// Ce fichier centralise les schemas de tables PostgreSQL du BC Bulletins.
export * from './FicheCotationSchema';
export * from './CoteColonneSchema';
export * from './ResultatBulletinSchema';
export * from './ClassementSchema';
export * from './BulletinSchema';
export * from './LigneBulletinSchema';
export * from './ProclamationSchema';
export * from './LigneProclamationSchema';
export * from './SyntheseResultatsSchema';
export * from './MigrationBulletinSchema';
export * from './SnapshotBulletinSchema';
export * from './ArchiveBulletinSchema';
export * from './AuditEncodageSchema';
export * from './OfflineOperationSchema';

export const schemasTablesBulletinsEvaluations = {
  fichesCotation: FicheCotationSchema.table,
  cotesColonnes: CoteColonneSchema.table,
  resultatsBulletins: ResultatBulletinSchema.table,
  classements: ClassementSchema.table,
  bulletins: BulletinSchema.table,
  lignesBulletins: LigneBulletinSchema.table,
  proclamations: ProclamationSchema.table,
  lignesProclamations: LigneProclamationSchema.table,
  synthesesEcoles: SyntheseResultatsSchema.table,
  migrationsBulletins: MigrationBulletinSchema.table,
  snapshotsBulletins: SnapshotBulletinSchema.table,
  archivesBulletins: ArchiveBulletinSchema.table,
  auditEncodage: AuditEncodageSchema.table,
  operationsOffline: OfflineOperationSchema.table,
} as const;
