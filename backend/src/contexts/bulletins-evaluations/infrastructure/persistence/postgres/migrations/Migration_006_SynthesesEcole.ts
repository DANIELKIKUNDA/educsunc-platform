// Ce fichier decrit la migration documentaire de creation des syntheses d'ecole.
export const Migration_006_SynthesesEcole = {
  nom: 'Migration_006_SynthesesEcole',
  description: 'Creation des tables de synthese globale des resultats par ecole.',
  sql: ['create table if not exists syntheses_resultats_ecoles (...)'],
} as const;
