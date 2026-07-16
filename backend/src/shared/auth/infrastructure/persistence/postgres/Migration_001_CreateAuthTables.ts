import type { PoolClient } from 'pg';

import type { MigrationPostgresAuth } from './MigrationPostgresAuth';

export class Migration_001_CreateAuthTables implements MigrationPostgresAuth {
  public readonly version = 1;
  public readonly nom = 'create_auth_persistence_tables';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_utilisateurs (
        id_utilisateur TEXT PRIMARY KEY,
        nom_complet TEXT NOT NULL CHECK (length(trim(nom_complet)) > 0),
        email TEXT NOT NULL,
        telephone TEXT,
        mot_de_passe_hash TEXT NOT NULL CHECK (length(mot_de_passe_hash) > 0),
        etat_compte TEXT NOT NULL CHECK (etat_compte IN ('ACTIVE', 'SUSPENDED', 'DISABLED')),
        token_version INTEGER NOT NULL CHECK (token_version > 0),
        dernier_acces_le TIMESTAMPTZ,
        dernier_login_le TIMESTAMPTZ,
        nombre_tentatives_connexion INTEGER NOT NULL DEFAULT 0 CHECK (nombre_tentatives_connexion >= 0),
        compte_verrouille_jusqua TIMESTAMPTZ,
        auth_offline_autorisee BOOLEAN NOT NULL DEFAULT FALSE,
        cree_le TIMESTAMPTZ NOT NULL,
        modifie_le TIMESTAMPTZ,
        version INTEGER NOT NULL CHECK (version > 0),
        supprime_logiquement BOOLEAN NOT NULL DEFAULT FALSE,
        CONSTRAINT auth_utilisateurs_email_normalise_unique UNIQUE (email),
        CONSTRAINT auth_utilisateurs_dates_coherentes CHECK (modifie_le IS NULL OR modifie_le >= cree_le)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_utilisateurs_etat ON auth_utilisateurs (etat_compte) WHERE supprime_logiquement = FALSE');
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_utilisateurs_verrouillage ON auth_utilisateurs (compte_verrouille_jusqua) WHERE compte_verrouille_jusqua IS NOT NULL');

    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
        id_refresh_token TEXT PRIMARY KEY,
        id_utilisateur TEXT NOT NULL REFERENCES auth_utilisateurs(id_utilisateur) ON DELETE RESTRICT,
        token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) >= 32),
        expire_le TIMESTAMPTZ NOT NULL,
        revoque BOOLEAN NOT NULL DEFAULT FALSE,
        revoque_le TIMESTAMPTZ,
        cree_le TIMESTAMPTZ NOT NULL,
        version INTEGER NOT NULL CHECK (version > 0),
        CONSTRAINT auth_refresh_tokens_revocation_coherente CHECK ((revoque = FALSE AND revoque_le IS NULL) OR revoque = TRUE),
        CONSTRAINT auth_refresh_tokens_expiration_coherente CHECK (expire_le > cree_le)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_utilisateur ON auth_refresh_tokens (id_utilisateur, revoque)');

    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_sessions_utilisateurs (
        id_session_utilisateur TEXT PRIMARY KEY,
        id_utilisateur TEXT NOT NULL REFERENCES auth_utilisateurs(id_utilisateur) ON DELETE RESTRICT,
        refresh_token_id TEXT NOT NULL REFERENCES auth_refresh_tokens(id_refresh_token) ON DELETE RESTRICT,
        adresse_ip TEXT,
        user_agent TEXT,
        device_id TEXT,
        est_offline BOOLEAN NOT NULL DEFAULT FALSE,
        expire_le TIMESTAMPTZ,
        revoquee_le TIMESTAMPTZ,
        raison_revocation TEXT,
        dernier_refresh_le TIMESTAMPTZ,
        organisation_active_id TEXT,
        ecole_active_id TEXT,
        cree_le TIMESTAMPTZ NOT NULL,
        version INTEGER NOT NULL CHECK (version > 0),
        CONSTRAINT auth_sessions_contexte_coherent CHECK (ecole_active_id IS NULL OR organisation_active_id IS NOT NULL),
        CONSTRAINT auth_sessions_revocation_coherente CHECK (revoquee_le IS NULL OR raison_revocation IS NOT NULL),
        CONSTRAINT auth_sessions_expiration_coherente CHECK (expire_le IS NULL OR expire_le > cree_le)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_utilisateur ON auth_sessions_utilisateurs (id_utilisateur, revoquee_le)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiration ON auth_sessions_utilisateurs (expire_le) WHERE revoquee_le IS NULL');

    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_contextes_actifs (
        id_contexte_actif_auth TEXT PRIMARY KEY,
        id_utilisateur TEXT NOT NULL UNIQUE REFERENCES auth_utilisateurs(id_utilisateur) ON DELETE RESTRICT,
        organisation_active_id TEXT,
        ecole_active_id TEXT,
        dernier_changement_le TIMESTAMPTZ,
        version INTEGER NOT NULL CHECK (version > 0),
        CONSTRAINT auth_contextes_actifs_coherents CHECK (ecole_active_id IS NULL OR organisation_active_id IS NOT NULL)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_tentatives_connexion (
        id_tentative_connexion TEXT PRIMARY KEY,
        email TEXT NOT NULL CHECK (length(trim(email)) > 0),
        adresse_ip TEXT,
        user_agent TEXT,
        reussie BOOLEAN NOT NULL,
        raison_echec TEXT,
        date_tentative TIMESTAMPTZ NOT NULL,
        CONSTRAINT auth_tentatives_resultat_coherent CHECK (reussie = FALSE OR raison_echec IS NULL)
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_auth_tentatives_email_date ON auth_tentatives_connexion (email, date_tentative DESC)');
  }
}
