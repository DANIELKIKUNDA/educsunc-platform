// Ces structures de record centralisent le contrat PostgreSQL des mappers Audit.
export interface AuditEntryRow {
  id_audit_entry: string;
  action: string;
  type_principal: string;
  gravite: string;
  niveau: string;
  resultat: string;
  request_id: string | null;
  correlation_id: string | null;
  session_id: string | null;
  sync_id: string | null;
  replay_id: string | null;
  acteur_id: string | null;
  type_acteur: string;
  role_actif: string | null;
  type_ressource: string | null;
  id_ressource: string | null;
  libelle_ressource: string | null;
  organisation_id: string | null;
  ecole_id: string | null;
  scope: string;
  mode_offline: boolean;
  statut_synchronisation: string | null;
  retry_count: number;
  est_replay: boolean;
  est_retry: boolean;
  adresse_ip: string | null;
  user_agent: string | null;
  device_id: string | null;
  source_audit: string;
  source_runtime: string | null;
  version_application: string | null;
  date_action: string;
  date_creation_audit: string;
  date_synchronisation: string | null;
  ancien_etat: unknown;
  nouvel_etat: unknown;
  metadata: unknown;
  contexte_permissions: unknown;
  contexte_execution: unknown;
}

export interface AuditCategoryRow {
  id: number;
  audit_entry_id: string;
  categorie: string;
}

export interface AuditExportRow {
  id_audit_export: string;
  audit_entry_id: string;
  acteur_id: string | null;
  format_export: string;
  nombre_elements: number;
  date_generation: string;
  date_expiration: string | null;
  organisation_id: string | null;
  ecole_id: string | null;
}

export interface AuditArchiveRow {
  id_archive: string;
  audit_entry_id: string;
  date_archivage: string;
  raison_archivage: string | null;
  type_archive: string;
}

export interface AuditSyncConflictRow {
  id_audit_conflict: string;
  audit_entry_id: string;
  type_conflit: string;
  description_conflit: string | null;
  date_detection: string;
  date_resolution: string | null;
  statut_resolution: string;
}

export interface AuditIdempotencyRow {
  id: number;
  cle_idempotence: string;
  audit_entry_id: string;
  date_creation: string;
}

export interface AuditProjectionTimelineRow {
  id: number;
  audit_entry_id: string;
  acteur_id: string | null;
  id_ressource: string | null;
  action: string;
  gravite: string;
  resultat: string;
  correlation_id: string | null;
  organisation_id: string | null;
  ecole_id: string | null;
  scope: string;
  date_action: string;
}

export interface AuditAnalyticsDailyRow {
  cle_analytics: string;
  date_reference: string;
  dimensions: unknown;
  compteurs: unknown;
}

export interface AuditForensicLinkRow {
  id: number;
  audit_entry_source: string;
  audit_entry_cible: string;
  type_relation: string;
}
