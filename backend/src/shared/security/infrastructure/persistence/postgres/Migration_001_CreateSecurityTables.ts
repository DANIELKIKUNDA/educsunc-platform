import type { PoolClient } from 'pg';
import type { MigrationPostgresSecurity } from './MigrationPostgresSecurity';

export class Migration_001_CreateSecurityTables implements MigrationPostgresSecurity {
  public readonly version = 1;
  public readonly nom = 'create_security_persistence_tables';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_roles (
        id_role TEXT PRIMARY KEY,
        code_role TEXT NOT NULL UNIQUE,
        nom_role TEXT NOT NULL,
        description TEXT,
        niveau_acces TEXT NOT NULL CHECK (niveau_acces IN ('PLATEFORME','ORGANISATION','ECOLE')),
        est_systeme BOOLEAN NOT NULL DEFAULT FALSE,
        est_actif BOOLEAN NOT NULL DEFAULT TRUE,
        cree_le TIMESTAMPTZ NOT NULL,
        cree_par TEXT,
        modifie_le TIMESTAMPTZ,
        modifie_par TEXT,
        version INTEGER NOT NULL CHECK (version > 0)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_permissions_roles (
        id_permission_role TEXT PRIMARY KEY,
        id_role TEXT NOT NULL REFERENCES security_roles(id_role) ON DELETE CASCADE,
        permission TEXT NOT NULL,
        cree_le TIMESTAMPTZ NOT NULL,
        cree_par TEXT,
        CONSTRAINT security_permissions_role_unique UNIQUE (id_role, permission)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_restrictions_roles (
        id_restriction_role TEXT PRIMARY KEY,
        id_role TEXT NOT NULL REFERENCES security_roles(id_role) ON DELETE CASCADE,
        code_restriction TEXT NOT NULL,
        description TEXT,
        CONSTRAINT security_restrictions_role_unique UNIQUE (id_role, code_restriction)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_affectations_utilisateurs (
        id_affectation_utilisateur TEXT PRIMARY KEY,
        id_utilisateur TEXT NOT NULL REFERENCES auth_utilisateurs(id_utilisateur) ON DELETE RESTRICT,
        id_role TEXT NOT NULL REFERENCES security_roles(id_role) ON DELETE RESTRICT,
        niveau_acces TEXT NOT NULL CHECK (niveau_acces IN ('PLATEFORME','ORGANISATION','ECOLE')),
        id_organisation TEXT,
        id_ecole TEXT,
        id_section TEXT,
        id_classe TEXT,
        id_cours TEXT,
        etat_affectation TEXT NOT NULL CHECK (etat_affectation IN ('ACTIVE','INACTIVE','EXPIREE')),
        date_debut TIMESTAMPTZ NOT NULL,
        date_fin TIMESTAMPTZ,
        cree_le TIMESTAMPTZ NOT NULL,
        cree_par TEXT,
        version INTEGER NOT NULL CHECK (version > 0),
        CONSTRAINT security_affectation_ecole_organisation CHECK (id_ecole IS NULL OR id_organisation IS NOT NULL),
        CONSTRAINT security_affectation_cours_classe CHECK (id_cours IS NULL OR id_classe IS NOT NULL)
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS security_affectation_active_unique
      ON security_affectations_utilisateurs (
        id_utilisateur, id_role,
        COALESCE(id_organisation, ''), COALESCE(id_ecole, ''),
        COALESCE(id_section, ''), COALESCE(id_classe, ''), COALESCE(id_cours, '')
      ) WHERE etat_affectation = 'ACTIVE'
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_scopes_acces (
        id_scope_acces TEXT PRIMARY KEY,
        id_affectation_utilisateur TEXT NOT NULL REFERENCES security_affectations_utilisateurs(id_affectation_utilisateur) ON DELETE CASCADE,
        type_scope TEXT NOT NULL CHECK (type_scope IN ('PLATEFORME','ORGANISATION','ECOLE','SECTION','CLASSE','COURS')),
        valeur_scope TEXT NOT NULL,
        est_lecture_seule BOOLEAN NOT NULL DEFAULT FALSE,
        CONSTRAINT security_scope_affectation_unique UNIQUE (id_affectation_utilisateur, type_scope, valeur_scope)
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_affectations_titulariat (
        id_affectation_titulariat TEXT PRIMARY KEY,
        id_utilisateur TEXT NOT NULL REFERENCES auth_utilisateurs(id_utilisateur) ON DELETE RESTRICT,
        id_organisation TEXT NOT NULL,
        id_ecole TEXT NOT NULL,
        id_classe TEXT NOT NULL,
        id_annee_scolaire TEXT NOT NULL,
        est_actif BOOLEAN NOT NULL,
        date_debut TIMESTAMPTZ NOT NULL,
        date_fin TIMESTAMPTZ,
        cree_le TIMESTAMPTZ NOT NULL,
        cree_par TEXT,
        version INTEGER NOT NULL CHECK (version > 0)
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS security_titulariat_actif_classe_unique
      ON security_affectations_titulariat (id_classe, id_annee_scolaire)
      WHERE est_actif = TRUE
    `);
    await client.query('CREATE INDEX IF NOT EXISTS security_affectations_utilisateur_idx ON security_affectations_utilisateurs (id_utilisateur, etat_affectation)');
    await client.query('CREATE INDEX IF NOT EXISTS security_affectations_organisation_idx ON security_affectations_utilisateurs (id_organisation, etat_affectation)');
    await client.query('CREATE INDEX IF NOT EXISTS security_affectations_ecole_idx ON security_affectations_utilisateurs (id_ecole, etat_affectation)');
  }
}
