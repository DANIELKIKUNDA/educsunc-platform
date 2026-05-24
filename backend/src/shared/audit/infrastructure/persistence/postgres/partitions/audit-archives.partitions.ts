import type { AuditPostgresPartitionDefinition } from './audit-postgres-partition.types';

// Les archives Audit suivent une logique temporelle favorisant rotation et cold storage.
export const auditArchivesPartitionDefinition: AuditPostgresPartitionDefinition = {
  nom: 'audit_archives_monthly_range',
  tableParent: 'audit_archives',
  zone: 'archive',
  strategie: 'RANGE_DATE_ARCHIVAGE',
  colonneSource: 'date_archivage',
  granularite: 'MONTHLY',
  partitionParTenantEnV1: false,
  utiliseDateActionReelle: false,
  objectif:
    'Permettre la rotation, le cold storage futur et la restauration controlee des archives Audit par fenetre temporelle.',
  pruningAttendu: [
    'lecture archive par periode',
    'restauration archive ciblee',
    'exports archives',
  ],
  indexesLocauxAttendus: [
    'idx_audit_archives_date_archivage',
    'idx_audit_archives_tenant',
  ],
  queryRules: [
    {
      obligation: 'Rechercher les archives avec une periode de date_archivage ou de periode archivee.',
      justification: 'Le document insiste sur archivage par blocs et restauration ciblee.',
    },
  ],
  maintenanceRules: [
    {
      action: 'ROTATION',
      description: 'Faire tourner les archives anciennes vers le stockage froid futur.',
    },
    {
      action: 'ARCHIVAGE',
      description: 'Conserver la compatibilite avec archivage logique et par partitions.',
    },
    {
      action: 'MONITORING',
      description: 'Surveiller taille, age et densite des partitions archivees.',
    },
  ],
  notes: [
    'Le document met en avant l archivage de partitions entieres comme avantage majeur du partitionnement.',
  ],
};

