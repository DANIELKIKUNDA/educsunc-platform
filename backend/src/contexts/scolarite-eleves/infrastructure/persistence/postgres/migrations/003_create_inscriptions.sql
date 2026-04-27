CREATE TABLE IF NOT EXISTS inscriptions (
  id UUID PRIMARY KEY,
  id_organisation UUID NOT NULL,
  id_ecole UUID NOT NULL,
  id_eleve UUID NOT NULL,
  id_annee_scolaire UUID NOT NULL,
  date_inscription DATE NOT NULL,
  origine_inscription TEXT NOT NULL,
  statut_inscription TEXT NOT NULL,
  numero_ordre TEXT NULL,
  observation TEXT NULL,
  cree_par UUID NOT NULL,
  cree_le TIMESTAMPTZ NOT NULL,
  modifie_par UUID NULL,
  modifie_le TIMESTAMPTZ NULL,
  version INTEGER NOT NULL DEFAULT 1,
  supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_inscriptions_eleve_annee_active
  ON inscriptions (id_eleve, id_annee_scolaire)
  WHERE statut_inscription = 'VALIDEE' AND supprime_logiquement = FALSE;

CREATE INDEX IF NOT EXISTS ix_inscriptions_tenant ON inscriptions (id_organisation, id_ecole);
CREATE INDEX IF NOT EXISTS ix_inscriptions_annee ON inscriptions (id_annee_scolaire);
CREATE INDEX IF NOT EXISTS ix_inscriptions_eleve ON inscriptions (id_eleve);
