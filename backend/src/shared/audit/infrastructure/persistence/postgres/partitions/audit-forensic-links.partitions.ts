import type { AuditPostgresPartitionDefinition } from './audit-postgres-partition.types';

// Les liens forensic suivent indirectement la temporalite de leur audit source.
export const auditForensicLinksPartitionDefinition: AuditPostgresPartitionDefinition = {
  nom: 'audit_forensic_links_indirect_monthly_range',
  tableParent: 'audit_forensic_links',
  zone: 'forensic',
  strategie: 'INDIRECT_RANGE_VIA_SOURCE_AUDIT',
  colonneSource: 'id_audit_source',
  granularite: 'MONTHLY',
  partitionParTenantEnV1: false,
  utiliseDateActionReelle: true,
  partitionIndirecteVia: 'audit_entries.date_action',
  objectif:
    'Aligner la volumetrie forensic sur la chronologie de l audit source pour les investigations et reconstructions ciblees.',
  pruningAttendu: [
    'investigations temporelles',
    'reconstruction d incident',
    'exports forensic',
  ],
  indexesLocauxAttendus: [
    'idx_audit_forensic_links_source',
    'idx_audit_forensic_links_correlation',
  ],
  queryRules: [
    {
      obligation: 'Propager les bornes temporelles de l audit source vers les lectures forensic.',
      justification: 'La strategie recommandee du document est une partition temporelle indirecte via audit source.',
    },
  ],
  maintenanceRules: [
    {
      action: 'CREATION_AUTOMATIQUE',
      description: 'Creer les partitions forensic en coherence avec la table source principale.',
    },
    {
      action: 'ARCHIVAGE',
      description: 'Archiver les liens forensic en meme temps que les partitions temporelles sources.',
    },
    {
      action: 'MONITORING',
      description: 'Verifier la coherence entre fenetres temporelles forensic et sources audit.',
    },
  ],
  notes: [
    'Le document ne recommande pas un partitionnement tenant direct pour les liens forensic.',
  ],
};

