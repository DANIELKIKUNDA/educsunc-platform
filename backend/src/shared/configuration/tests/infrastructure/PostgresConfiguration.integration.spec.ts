import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import {
  AuditConfigurationPostgresPort,
  ClientPoolPostgresConfiguration,
  ConfigurationChange,
  ConfigurationId,
  ConfigurationValue,
  CreateConfigurationUseCase,
  ExceptionConflitVersionConfiguration,
  MigrateurPostgresConfiguration,
  RepositoryConfigurationPostgres,
  RepositoryConfigurationVersionPostgres,
  UpdateConfigurationUseCase,
  creerConfigurationPoolPostgresConfiguration,
  creerPoolPostgresConfiguration,
} from 'shared/configuration';
import { MonitoringConfigurationTestDouble } from '../support/ConfigurationTestSupport';

const executerIntegrationPostgres = process.env.EDUCSYN_RUN_POSTGRES_INTEGRATION === '1';

test('PostgreSQL Configuration persiste, relit apres reconnexion et refuse une concurrence obsolete', {
  skip: !executerIntegrationPostgres,
}, async () => {
  const suffixe = randomUUID();
  const configurationId = `test-configuration-${suffixe}`;
  const cle = `runtime.test.integration.${suffixe}`;
  const configurationPool = creerConfigurationPoolPostgresConfiguration();
  let pool = creerPoolPostgresConfiguration(configurationPool);
  let poolFerme = false;

  try {
    await new MigrateurPostgresConfiguration(pool).executerToutes();
    const client = new ClientPoolPostgresConfiguration(pool);
    const repository = new RepositoryConfigurationPostgres(client);
    const versions = new RepositoryConfigurationVersionPostgres(client);
    const audit = new AuditConfigurationPostgresPort(client);
    const monitoring = new MonitoringConfigurationTestDouble();
    const createUseCase = new CreateConfigurationUseCase(
      repository,
      audit,
      monitoring,
      undefined,
      undefined,
      undefined,
      versions,
      client,
    );

    await createUseCase.executer({
      configurationId,
      key: cle,
      value: 1,
      scope: { niveau: 'SYSTEM' },
      actorId: 'integration-manager-systeme',
    });

    const lectureConcurrenteA = await repository.trouverParId(
      ConfigurationId.creer(configurationId),
    );
    const lectureConcurrenteB = await repository.trouverParId(
      ConfigurationId.creer(configurationId),
    );
    assert.ok(lectureConcurrenteA);
    assert.ok(lectureConcurrenteB);

    const updateUseCase = new UpdateConfigurationUseCase(
      repository,
      versions,
      audit,
      monitoring,
      undefined,
      undefined,
      client,
    );
    await updateUseCase.executer({
      configurationId,
      value: 2,
      actorId: 'integration-manager-systeme',
    });

    lectureConcurrenteB.mettreAJour(
      ConfigurationValue.creer(3),
      new ConfigurationChange({
        type: 'UPDATED',
        actorId: 'integration-concurrent',
        changedAt: new Date(),
        metadata: {},
      }),
    );
    await assert.rejects(
      () => repository.sauvegarder(lectureConcurrenteB),
      ExceptionConflitVersionConfiguration,
    );

    await pool.end();
    poolFerme = true;
    pool = creerPoolPostgresConfiguration(configurationPool);
    poolFerme = false;
    const clientReconnecte = new ClientPoolPostgresConfiguration(pool);
    const repositoryReconnecte = new RepositoryConfigurationPostgres(clientReconnecte);
    const relue = await repositoryReconnecte.trouverParId(
      ConfigurationId.creer(configurationId),
    );

    assert.equal(relue?.details().valeur, 2);
    assert.equal(relue?.details().revisionPersistence, 1);

    const preuves = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM educsyn_configuration_versions WHERE configuration_id = $1) AS versions,
         (SELECT COUNT(*)::int FROM educsyn_configuration_audit_events WHERE configuration_id = $1) AS audits`,
      [configurationId],
    );
    assert.equal(preuves.rows[0]?.versions, 2);
    assert.ok(Number(preuves.rows[0]?.audits) >= 2);
  } finally {
    if (poolFerme) {
      pool = creerPoolPostgresConfiguration(configurationPool);
      poolFerme = false;
    }
    await pool.query('DELETE FROM educsyn_configuration_audit_events WHERE configuration_id = $1', [configurationId]);
    await pool.query('DELETE FROM educsyn_configuration_snapshots WHERE configuration_id = $1', [configurationId]);
    await pool.query('DELETE FROM educsyn_configuration_versions WHERE configuration_id = $1', [configurationId]);
    await pool.query('DELETE FROM educsyn_configuration_entries WHERE identifiant = $1', [configurationId]);
    await pool.end();
  }
});
