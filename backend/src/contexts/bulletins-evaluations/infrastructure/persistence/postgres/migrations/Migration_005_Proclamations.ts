// Ce fichier decrit la migration documentaire de creation des proclamations.
export const Migration_005_Proclamations = {
  nom: 'Migration_005_Proclamations',
  description: 'Creation des tables de proclamations de classe et de leurs lignes.',
  sql: [
    'create table if not exists proclamations_classes (...)',
    'create table if not exists lignes_proclamations_classes (...)',
  ],
} as const;
