CREATE TABLE IF NOT EXISTS eleves (
  id UUID PRIMARY KEY,
  id_organisation UUID NOT NULL,
  id_ecole UUID NOT NULL,
  matricule TEXT NOT NULL,
  nom TEXT NOT NULL,
  post_nom TEXT NOT NULL,
  prenom TEXT NULL,
  sexe TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  lieu_naissance TEXT NULL,
  nationalite TEXT NULL,
  ecole_provenance JSONB NOT NULL,
  id_famille UUID NULL,
  statut_global TEXT NOT NULL,
  cree_par UUID NOT NULL,
  cree_le TIMESTAMPTZ NOT NULL,
  modifie_par UUID NULL,
  modifie_le TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 1,
  supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_eleves_ecole_matricule
  ON eleves (id_ecole, matricule)
  WHERE supprime_logiquement = FALSE;

CREATE INDEX IF NOT EXISTS ix_eleves_tenant ON eleves (id_organisation, id_ecole);
CREATE INDEX IF NOT EXISTS ix_eleves_famille ON eleves (id_famille);
CREATE INDEX IF NOT EXISTS ix_eleves_identite ON eleves (id_ecole, nom, post_nom, date_naissance);
