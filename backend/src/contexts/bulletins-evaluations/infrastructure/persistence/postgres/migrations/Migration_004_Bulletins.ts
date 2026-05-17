// Ce fichier decrit la migration documentaire de creation des bulletins et de leurs lignes.
export const Migration_004_Bulletins = {
  nom: 'Migration_004_Bulletins',
  description: 'Creation des tables principales des bulletins et de leurs lignes.',
  sql: [
    'create table if not exists bulletins_eleves (...)',
    'create table if not exists lignes_bulletins_eleves (...)',
  ],
} as const;
