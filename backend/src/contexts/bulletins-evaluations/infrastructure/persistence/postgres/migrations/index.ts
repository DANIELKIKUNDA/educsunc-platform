import { Migration_001_FichesCotation } from './Migration_001_FichesCotation';
import { Migration_002_ResultatsBulletin } from './Migration_002_ResultatsBulletin';
import { Migration_003_Classements } from './Migration_003_Classements';
import { Migration_004_Bulletins } from './Migration_004_Bulletins';
import { Migration_005_Proclamations } from './Migration_005_Proclamations';
import { Migration_006_SynthesesEcole } from './Migration_006_SynthesesEcole';
import { Migration_007_MigrationBulletin } from './Migration_007_MigrationBulletin';
import { Migration_008_AuditEncodage } from './Migration_008_AuditEncodage';
import { Migration_009_OfflineOperations } from './Migration_009_OfflineOperations';
import { Migration_010_RlsBulletins } from './Migration_010_RlsBulletins';
import { Migration_011_Snapshots } from './Migration_011_Snapshots';
import { Migration_012_ArchivesBulletins } from './Migration_012_ArchivesBulletins';

// Ce type represente une migration documentaire locale du BC.
export interface MigrationSqlBulletinsEvaluations {
  nom: string;
  description: string;
  sql: readonly string[];
}

// Ce fichier centralise les migrations SQL documentaires du BC Bulletins & Evaluations.
export * from './Migration_001_FichesCotation';
export * from './Migration_002_ResultatsBulletin';
export * from './Migration_003_Classements';
export * from './Migration_004_Bulletins';
export * from './Migration_005_Proclamations';
export * from './Migration_006_SynthesesEcole';
export * from './Migration_007_MigrationBulletin';
export * from './Migration_008_AuditEncodage';
export * from './Migration_009_OfflineOperations';
export * from './Migration_010_RlsBulletins';
export * from './Migration_011_Snapshots';
export * from './Migration_012_ArchivesBulletins';

export const migrationsPostgresBulletinsEvaluations: MigrationSqlBulletinsEvaluations[] = [
  Migration_001_FichesCotation,
  Migration_002_ResultatsBulletin,
  Migration_003_Classements,
  Migration_004_Bulletins,
  Migration_005_Proclamations,
  Migration_006_SynthesesEcole,
  Migration_007_MigrationBulletin,
  Migration_008_AuditEncodage,
  Migration_009_OfflineOperations,
  Migration_010_RlsBulletins,
  Migration_011_Snapshots,
  Migration_012_ArchivesBulletins,
];
