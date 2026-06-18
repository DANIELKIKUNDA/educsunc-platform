// Cette migration declare les titulariats de classes.
export const createTitulariatTable = {
  nom: 'create_titulariat_table',
  sql: 'CREATE TABLE IF NOT EXISTS security_affectations_titulariat (id_affectation_titulariat UUID PRIMARY KEY, id_utilisateur TEXT NOT NULL, id_organisation TEXT NOT NULL, id_ecole TEXT NOT NULL, id_classe TEXT NOT NULL, id_annee_scolaire TEXT NOT NULL, est_actif BOOLEAN NOT NULL, date_debut TIMESTAMP NOT NULL, date_fin TIMESTAMP NULL, cree_le TIMESTAMP NOT NULL, cree_par TEXT NULL, version INTEGER NOT NULL);',
};
