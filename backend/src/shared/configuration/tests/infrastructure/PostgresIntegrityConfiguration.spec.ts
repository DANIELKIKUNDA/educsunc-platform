import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Pool } from 'pg';

import {
  AuditConfigurationPostgresPort,
  ClientPoolPostgresConfiguration,
  Configuration,
  ConfigurationChange,
  ConfigurationBootstrapJournalStoreFichier,
  ConfigurationId,
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationValue,
  ExceptionConflitVersionConfiguration,
  MigrateurPostgresConfiguration,
  RepositoryConfigurationPostgres,
  RepositoryConfigurationSnapshotPostgres,
  RepositoryConfigurationVersionPostgres,
} from 'shared/configuration';
import type {
  ResultatExecutionSql,
  SqlQueryClient,
} from 'shared/infrastructure/persistence/SqlQueryClient';

class ClientSqlEspion implements SqlQueryClient {
  public readonly appels: Array<{ sql: string; parametres: readonly unknown[] }> = [];

  constructor(
    private readonly repondre: (
      sql: string,
      parametres: readonly unknown[],
    ) => ResultatExecutionSql<any>,
  ) {}

  public async executer<TLigne extends object = Record<string, unknown>>(
    sql: string,
    parametres: readonly unknown[] = [],
  ): Promise<ResultatExecutionSql<TLigne>> {
    this.appels.push({ sql, parametres });
    return this.repondre(sql, parametres) as ResultatExecutionSql<TLigne>;
  }
}

function creerConfiguration(revisionPersistence: number | null = null): Configuration {
  if (revisionPersistence === null) {
    return new Configuration(
      ConfigurationId.creer('configuration-integrite-1'),
      ConfigurationScope.creer({ niveau: 'SYSTEM' }),
      ConfigurationKey.creer('runtime.retry.max'),
      ConfigurationValue.creer(3),
    );
  }

  return Configuration.reconstituer({
    identifiant: 'configuration-integrite-1',
    scope: { niveau: 'SYSTEM' },
    key: 'runtime.retry.max',
    valeur: 3,
    statut: 'ACTIVE',
    creeLe: new Date('2026-01-01T00:00:00.000Z'),
    gouvernance: {
      proprietaireNiveau: 'SYSTEM',
      heritable: true,
      overridable: true,
      visiblePour: ['SYSTEM'],
      auditRequis: true,
      restartRequis: false,
    },
    overrides: [],
    lock: null,
    totalVersions: 1,
    revisionPersistence,
  });
}

test('RepositoryConfigurationPostgres initialise puis incremente la revision de persistence', async () => {
  let prochaineRevision = 0;
  const client = new ClientSqlEspion(() => ({
    lignes: [{ revision: prochaineRevision++ }],
    nombreLignesAffectees: 1,
  }));
  const repository = new RepositoryConfigurationPostgres(client);
  const nouvelle = creerConfiguration();

  await repository.sauvegarder(nouvelle);
  assert.equal(nouvelle.details().revisionPersistence, 0);
  assert.match(client.appels[0]?.sql ?? '', /INSERT INTO educsyn_configuration_entries/);

  await repository.sauvegarder(nouvelle);
  assert.equal(nouvelle.details().revisionPersistence, 1);
  assert.match(client.appels[1]?.sql ?? '', /AND revision = \$14/);
  assert.equal(client.appels[1]?.parametres.at(-1), 0);
});

test('RepositoryConfigurationPostgres refuse une ecriture construite sur une revision obsolete', async () => {
  const client = new ClientSqlEspion(() => ({ lignes: [], nombreLignesAffectees: 0 }));
  const repository = new RepositoryConfigurationPostgres(client);

  await assert.rejects(
    () => repository.sauvegarder(creerConfiguration(4)),
    ExceptionConflitVersionConfiguration,
  );
});

test('les versions et snapshots PostgreSQL sont inseres sans ecrasement silencieux', async () => {
  const client = new ClientSqlEspion(() => ({ lignes: [], nombreLignesAffectees: 1 }));
  const versionRepository = new RepositoryConfigurationVersionPostgres(client);
  const snapshotRepository = new RepositoryConfigurationSnapshotPostgres(client);
  const configuration = creerConfiguration();
  configuration.mettreAJour(
    ConfigurationValue.creer(4),
    new ConfigurationChange({
      type: 'UPDATED',
      actorId: 'manager-systeme',
      changedAt: new Date(),
      metadata: {},
    }),
  );
  const version = configuration.versionsHistorisees().at(-1);
  assert.ok(version);

  await versionRepository.sauvegarder(version);
  const snapshot = configuration.creerSnapshot('snapshot-immuable-1', []);
  await snapshotRepository.sauvegarder(snapshot);

  assert.equal(client.appels.length, 2);
  assert.doesNotMatch(client.appels[0]?.sql ?? '', /ON CONFLICT/i);
  assert.doesNotMatch(client.appels[1]?.sql ?? '', /ON CONFLICT/i);
});

test('ClientPoolPostgresConfiguration valide une transaction reussie sur une seule connexion', async () => {
  const requetesClient: string[] = [];
  let liberations = 0;
  const clientPool = {
    query: async (sql: string) => {
      requetesClient.push(sql);
      return { rows: [], rowCount: 0 };
    },
    release: () => { liberations += 1; },
  };
  const pool = {
    connect: async () => clientPool,
    query: async () => { throw new Error('La connexion du pool ne doit pas etre utilisee dans la transaction.'); },
  } as unknown as Pool;
  const uniteTravail = new ClientPoolPostgresConfiguration(pool);

  await uniteTravail.dansTransaction(async () => {
    await uniteTravail.executer('SELECT 1');
    await uniteTravail.dansTransaction(async () => uniteTravail.executer('SELECT 2'));
  });

  assert.deepEqual(requetesClient, ['BEGIN', 'SELECT 1', 'SELECT 2', 'COMMIT']);
  assert.equal(liberations, 1);
});

test('ClientPoolPostgresConfiguration annule toute la transaction apres une erreur', async () => {
  const requetesClient: string[] = [];
  const clientPool = {
    query: async (sql: string) => {
      requetesClient.push(sql);
      return { rows: [], rowCount: 0 };
    },
    release: () => undefined,
  };
  const pool = { connect: async () => clientPool } as unknown as Pool;
  const uniteTravail = new ClientPoolPostgresConfiguration(pool);

  await assert.rejects(
    () => uniteTravail.dansTransaction(async () => {
      await uniteTravail.executer('UPDATE configuration');
      throw new Error('echec audit');
    }),
    /echec audit/,
  );

  assert.deepEqual(requetesClient, ['BEGIN', 'UPDATE configuration', 'ROLLBACK']);
});

test('AuditConfigurationPostgresPort conserve les evenements dans la persistence durable', async () => {
  const client = new ClientSqlEspion(() => ({ lignes: [], nombreLignesAffectees: 1 }));
  const audit = new AuditConfigurationPostgresPort(client);

  await audit.enregistrerEvenementsConfiguration('configuration-integrite-1', [
    { type: 'ConfigurationUpdated', actorId: 'manager-systeme', updatedAt: new Date() },
  ]);

  assert.equal(client.appels.length, 1);
  assert.match(client.appels[0]?.sql ?? '', /INSERT INTO educsyn_configuration_audit_events/);
  assert.equal(client.appels[0]?.parametres[1], 'configuration-integrite-1');
});

test('MigrateurPostgresConfiguration verrouille, trace et ne rejoue pas les migrations appliquees', async () => {
  const versionsAppliquees = new Set<number>();
  const requetes: string[] = [];
  let liberations = 0;
  const clientPool = {
    query: async (sql: string, parametres: readonly unknown[] = []) => {
      const requete = sql.trim();
      requetes.push(requete);
      if (requete.startsWith('SELECT version FROM educsyn_configuration_schema_migrations')) {
        const version = Number(parametres[0]);
        return {
          rows: versionsAppliquees.has(version) ? [{ version }] : [],
          rowCount: versionsAppliquees.has(version) ? 1 : 0,
        };
      }
      if (requete.startsWith('INSERT INTO educsyn_configuration_schema_migrations')) {
        versionsAppliquees.add(Number(parametres[0]));
      }
      if (requete.startsWith('SELECT cle, scope_niveau')) {
        return { rows: [], rowCount: 0 };
      }
      return { rows: [], rowCount: 0 };
    },
    release: () => { liberations += 1; },
  };
  const pool = { connect: async () => clientPool } as unknown as Pool;
  const migrateur = new MigrateurPostgresConfiguration(pool);

  await migrateur.executerToutes();
  const creationsApresPremierDemarrage = requetes.filter((sql) => (
    sql.startsWith('CREATE TABLE IF NOT EXISTS educsyn_configuration_entries')
    || sql.startsWith('ALTER TABLE educsyn_configuration_entries')
  )).length;
  await migrateur.executerToutes();
  const creationsApresSecondDemarrage = requetes.filter((sql) => (
    sql.startsWith('CREATE TABLE IF NOT EXISTS educsyn_configuration_entries')
    || sql.startsWith('ALTER TABLE educsyn_configuration_entries')
  )).length;

  assert.deepEqual([...versionsAppliquees], [1, 2]);
  assert.equal(creationsApresPremierDemarrage, 2);
  assert.equal(creationsApresSecondDemarrage, 2);
  assert.equal(
    requetes.filter((sql) => sql.includes("pg_advisory_xact_lock(hashtext('educsyn_configuration_migrations'))")).length,
    2,
  );
  assert.equal(liberations, 2);
});

test('le journal fichier serialise les ecritures concurrentes et met un ancien contenu invalide en quarantaine', async () => {
  const dossier = await mkdtemp(path.join(tmpdir(), 'educsyn-bootstrap-journal-'));
  const chemin = path.join(dossier, 'bootstrap-journal.json');
  await writeFile(chemin, '[{"contenu":"incomplet"}', 'utf8');

  try {
    await Promise.all(Array.from({ length: 12 }, async (_, index) => {
      const store = new ConfigurationBootstrapJournalStoreFichier(chemin);
      await store.journaliser({
        executionId: `execution-${index}`,
        executedAt: new Date().toISOString(),
        type: 'TEST_CONCURRENT',
        scope: { niveau: 'SYSTEM' },
        createdKeys: [`runtime.test.${index}`],
        skippedKeys: [],
      });
    }));

    const journal = JSON.parse(await readFile(chemin, 'utf8')) as Array<{ executionId: string }>;
    const fichiers = await readdir(dossier);
    assert.equal(journal.length, 12);
    assert.equal(new Set(journal.map((entry) => entry.executionId)).size, 12);
    assert.equal(fichiers.filter((nom) => nom.includes('.corrupt.')).length, 1);
    assert.equal(fichiers.some((nom) => nom.endsWith('.lock')), false);
    assert.equal(fichiers.some((nom) => nom.endsWith('.tmp')), false);
  } finally {
    await rm(dossier, { recursive: true, force: true });
  }
});
