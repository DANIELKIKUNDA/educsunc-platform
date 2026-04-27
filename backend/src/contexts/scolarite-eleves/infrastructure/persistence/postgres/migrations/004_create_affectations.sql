CREATE TABLE IF NOT EXISTS affectations (
  id UUID PRIMARY KEY,
  id_organisation UUID NOT NULL,
  id_ecole UUID NOT NULL,
  id_inscription_scolaire UUID NOT NULL,
  id_classe_pedagogique UUID NOT NULL,
  date_affectation DATE NOT NULL,
  motif_affectation TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  cree_par UUID NOT NULL,
  cree_le TIMESTAMPTZ NOT NULL,
  modifie_par UUID NULL,
  modifie_le TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 1,
  supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_affectations_inscription_active
  ON affectations (id_inscription_scolaire)
  WHERE active = TRUE AND supprime_logiquement = FALSE;

CREATE INDEX IF NOT EXISTS ix_affectations_tenant ON affectations (id_organisation, id_ecole);
CREATE INDEX IF NOT EXISTS ix_affectations_classe ON affectations (id_classe_pedagogique);
