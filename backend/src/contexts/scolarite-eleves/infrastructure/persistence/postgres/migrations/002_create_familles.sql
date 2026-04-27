CREATE TABLE IF NOT EXISTS familles (
  id UUID PRIMARY KEY,
  id_organisation UUID NOT NULL,
  id_ecole UUID NOT NULL,
  code_famille TEXT NOT NULL,
  nom_famille TEXT NOT NULL,
  adresse TEXT NULL,
  telephone_principal TEXT NOT NULL,
  email TEXT NULL,
  responsables JSONB NOT NULL DEFAULT '[]'::jsonb,
  cree_par UUID NOT NULL,
  cree_le TIMESTAMPTZ NOT NULL,
  modifie_par UUID NULL,
  modifie_le TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 1,
  supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_familles_ecole_code
  ON familles (id_ecole, code_famille)
  WHERE supprime_logiquement = FALSE;

CREATE INDEX IF NOT EXISTS ix_familles_tenant ON familles (id_organisation, id_ecole);
