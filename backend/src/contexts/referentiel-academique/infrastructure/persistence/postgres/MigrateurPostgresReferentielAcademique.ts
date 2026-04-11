import { type Pool } from 'pg';
import { InfrastructureError } from '../../../../../shared/exceptions/InfrastructureError';
import type { Journaliseur } from '../../../../../shared/infrastructure/logger/Logger';
import { JournaliseurPino } from '../../../../../shared/infrastructure/logger/PinoLogger';
import {
  migrationsPostgresReferentielAcademique,
  type MigrationPostgresReferentielAcademique,
} from './migrations';

interface LigneMigrationExecuteePostgres {
  id_migration: string;
  description: string;
  executee_le: Date | string;
}

// Cette interface decrit une migration deja executee dans PostgreSQL.
export interface EtatMigrationPostgresReferentielAcademique {
  idMigration: string;
  description: string;
  executeeLe: Date;
}

// Cette interface decrit le bilan d'une execution de migrations.
export interface BilanExecutionMigrationsPostgresReferentielAcademique {
  executees: string[];
  sautees: string[];
}

// Cette classe execute les migrations PostgreSQL concretes du BC Referentiel Academique.
export class MigrateurPostgresReferentielAcademique {
  private readonly pool: Pool;
  private readonly journaliseur: Journaliseur;
  private readonly nomTableSuivi = 'referentiel_academique_migrations';

  // Ce constructeur injecte le pool PostgreSQL et le journaliseur technique.
  constructor(pool: Pool, journaliseur: Journaliseur = new JournaliseurPino()) {
    this.pool = pool;
    this.journaliseur = journaliseur;
  }

  // Cette methode initialise la table technique de suivi des migrations.
  public async initialiserSuiviMigrations(): Promise<void> {
    await this.pool.query(
      [
        `CREATE TABLE IF NOT EXISTS "${this.nomTableSuivi}" (`,
        '"id_migration" varchar(160) NOT NULL PRIMARY KEY,',
        '"description" text NOT NULL,',
        '"executee_le" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP',
        ');',
      ].join(' '),
    );
  }

  // Cette methode liste les migrations deja executees dans la base cible.
  public async listerMigrationsExecutees(): Promise<readonly EtatMigrationPostgresReferentielAcademique[]> {
    await this.initialiserSuiviMigrations();

    const resultat = await this.pool.query<LigneMigrationExecuteePostgres>(
      [
        `SELECT "id_migration", "description", "executee_le"`,
        `FROM "${this.nomTableSuivi}"`,
        'ORDER BY "executee_le" ASC, "id_migration" ASC',
      ].join(' '),
    );

    return resultat.rows.map((ligne) => ({
      idMigration: ligne.id_migration,
      description: ligne.description,
      executeeLe: this.convertirEnDate(ligne.executee_le, 'executee_le'),
    }));
  }

  // Cette methode execute les migrations encore absentes de la base cible.
  public async executerMigrationsEnAttente(
    migrations: readonly MigrationPostgresReferentielAcademique[] = migrationsPostgresReferentielAcademique,
  ): Promise<BilanExecutionMigrationsPostgresReferentielAcademique> {
    await this.initialiserSuiviMigrations();

    const dejaExecutees = new Set(
      (await this.listerMigrationsExecutees()).map((migration) => migration.idMigration),
    );
    const executees: string[] = [];
    const sautees: string[] = [];

    for (const migration of migrations) {
      if (dejaExecutees.has(migration.idMigration)) {
        sautees.push(migration.idMigration);
        continue;
      }

      await this.executerMigration(migration);
      executees.push(migration.idMigration);
    }

    return {
      executees,
      sautees,
    };
  }

  private async executerMigration(
    migration: MigrationPostgresReferentielAcademique,
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      this.journaliseur.info('Execution d une migration PostgreSQL du referentiel academique.', {
        idMigration: migration.idMigration,
      });

      await client.query('BEGIN');

      for (const requeteSql of migration.genererSqlMontee()) {
        await client.query(requeteSql);
      }

      await client.query(
        [
          `INSERT INTO "${this.nomTableSuivi}"`,
          '("id_migration", "description")',
          'VALUES ($1, $2)',
        ].join(' '),
        [migration.idMigration, migration.description],
      );

      await client.query('COMMIT');
    } catch (erreur) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Cette annulation defensive ne doit pas masquer l'erreur principale.
      }

      this.journaliseur.erreur(
        'Une migration PostgreSQL du referentiel academique a echoue.',
        {
          idMigration: migration.idMigration,
          erreur: this.decrireErreur(erreur),
        },
      );

      throw new InfrastructureError(
        'L execution d une migration PostgreSQL du referentiel academique a echoue.',
        'EXECUTION_MIGRATION_POSTGRES_REFERENTIEL_ACADEMIQUE',
        {
          idMigration: migration.idMigration,
          messageErreur: this.decrireErreur(erreur),
        },
      );
    } finally {
      client.release();
    }
  }

  private convertirEnDate(valeur: Date | string, nomChamp: string): Date {
    if (valeur instanceof Date && !Number.isNaN(valeur.getTime())) {
      return new Date(valeur.getTime());
    }

    if (typeof valeur === 'string') {
      const date = new Date(valeur);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    throw new InfrastructureError(
      `Le champ "${nomChamp}" ne contient pas une date PostgreSQL exploitable.`,
      'LECTURE_DATE_MIGRATION_POSTGRES_INVALIDE',
      {
        nomChamp,
        valeur,
      },
    );
  }

  private decrireErreur(erreur: unknown): string {
    if (erreur instanceof Error) {
      return erreur.message;
    }

    if (typeof erreur === 'string') {
      return erreur;
    }

    try {
      return JSON.stringify(erreur);
    } catch {
      return 'Erreur inconnue';
    }
  }
}
