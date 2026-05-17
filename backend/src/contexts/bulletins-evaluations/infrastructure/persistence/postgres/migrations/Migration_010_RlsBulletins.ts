// Ce fichier decrit la migration documentaire de mise en place des policies RLS bulletins.
export const Migration_010_RlsBulletins = {
  nom: 'Migration_010_RlsBulletins',
  description: 'Activation des policies RLS sur les tables principales du BC.',
  sql: ['alter table bulletins_eleves enable row level security'],
} as const;
