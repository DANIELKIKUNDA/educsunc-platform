// Ce fichier decrit la migration documentaire de creation de l'audit d'encodage.
export const Migration_008_AuditEncodage = {
  nom: 'Migration_008_AuditEncodage',
  description: 'Creation des tables d audit des encodages et modifications de cotes.',
  sql: ['create table if not exists audit_encodage_bulletins (...)'],
} as const;
