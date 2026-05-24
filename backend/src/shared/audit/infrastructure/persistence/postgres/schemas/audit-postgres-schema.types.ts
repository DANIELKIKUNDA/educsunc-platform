// Ces types structurent les schemas documentaires PostgreSQL du module Audit.

export interface AuditPostgresColumnSchema {
  nom: string;
  definitionSql: string;
  critique?: boolean;
  justification?: string;
}

export interface AuditPostgresConstraintSchema {
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null' | 'append_only_guard';
  expression: string;
  justification?: string;
}

export interface AuditPostgresPreparationSchema {
  type: 'indexation' | 'partitionnement' | 'forensic' | 'offline' | 'archivage';
  details: readonly string[];
}

export interface AuditPostgresTableSchema {
  table: string;
  mission: string;
  zone: 'transactionnelle' | 'projection' | 'analytics' | 'forensic' | 'archive' | 'idempotency';
  appendOnly: boolean;
  colonnes: readonly AuditPostgresColumnSchema[];
  contraintes: readonly AuditPostgresConstraintSchema[];
  jsonbAutorises?: readonly string[];
  jsonbInterdits?: readonly string[];
  preparations?: readonly AuditPostgresPreparationSchema[];
  notes?: readonly string[];
}
