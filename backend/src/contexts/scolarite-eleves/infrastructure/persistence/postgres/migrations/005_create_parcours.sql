CREATE TABLE IF NOT EXISTS parcours (
  id UUID PRIMARY KEY,
  id_organisation UUID NOT NULL,
  id_ecole UUID NOT NULL,
  id_eleve UUID NOT NULL,
  historique JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_parcours_eleve ON parcours (id_eleve);
CREATE INDEX IF NOT EXISTS ix_parcours_tenant ON parcours (id_organisation, id_ecole);
