import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ConfigurationInitialisationOfficielleService } from '../services/ConfigurationInitialisationOfficielleService';
import {
  CreateConfigurationUseCase,
  RepositoryConfigurationMemoire,
} from '../../shared/configuration';
import {
  AuditConfigurationTestDouble,
  MonitoringConfigurationTestDouble,
} from '../../shared/configuration/tests/support/ConfigurationTestSupport';

test('ConfigurationInitialisationOfficielleService initialise une organisation de facon idempotente', async () => {
  const repository = new RepositoryConfigurationMemoire();
  const service = new ConfigurationInitialisationOfficielleService(
    new CreateConfigurationUseCase(
      repository,
      new AuditConfigurationTestDouble(),
      new MonitoringConfigurationTestDouble(),
    ),
    () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    path.join(mkdtempSync(path.join(tmpdir(), 'educsyn-config-org-')), 'journal.json'),
  );

  const premierPassage = await service.amorcerOrganisation({ organisationId: 'org-1' });
  const secondPassage = await service.amorcerOrganisation({ organisationId: 'org-1' });

  assert.deepEqual(premierPassage.createdKeys, ['modules.allowed']);
  assert.deepEqual(secondPassage.createdKeys, []);
  assert.deepEqual(secondPassage.skippedKeys, ['modules.allowed']);
  assert.equal(repository.stockageMemoire().lister().length, 1);
});

test('ConfigurationInitialisationOfficielleService ne cree aucune cle systeme sans valeur initiale officiellement prouvee', async () => {
  const repository = new RepositoryConfigurationMemoire();
  const service = new ConfigurationInitialisationOfficielleService(
    new CreateConfigurationUseCase(
      repository,
      new AuditConfigurationTestDouble(),
      new MonitoringConfigurationTestDouble(),
    ),
    () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    path.join(mkdtempSync(path.join(tmpdir(), 'educsyn-config-system-')), 'journal.json'),
  );

  const resultat = await service.amorcerSysteme();

  assert.deepEqual(resultat.createdKeys, []);
  assert.deepEqual(resultat.skippedKeys, []);
  assert.equal(repository.stockageMemoire().lister().length, 0);
});

test("ConfigurationInitialisationOfficielleService n'ecrase jamais une configuration organisation deja personnalisee", async () => {
  const repository = new RepositoryConfigurationMemoire();
  const createUseCase = new CreateConfigurationUseCase(
    repository,
    new AuditConfigurationTestDouble(),
    new MonitoringConfigurationTestDouble(),
  );

  await createUseCase.executer({
    configurationId: 'cfg-org-personnalisee',
    key: 'modules.allowed',
    value: ['PAIEMENTS_FACTURATION'],
    scope: {
      niveau: 'ORGANIZATION',
      organisationId: 'org-2',
    },
    actorId: 'promoteur-org-2',
  });

  const service = new ConfigurationInitialisationOfficielleService(
    createUseCase,
    () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    path.join(mkdtempSync(path.join(tmpdir(), 'educsyn-config-org-custom-')), 'journal.json'),
  );

  const resultat = await service.amorcerOrganisation({ organisationId: 'org-2' });
  const configuration = repository.stockageMemoire().lister()[0]?.configuration;

  assert.deepEqual(resultat.createdKeys, []);
  assert.deepEqual(resultat.skippedKeys, ['modules.allowed']);
  assert.deepEqual(configuration?.details().valeur, ['PAIEMENTS_FACTURATION']);
});

test("ConfigurationInitialisationOfficielleService initialise l'ecole sans activer automatiquement les modules", async () => {
  const dossierTemporaire = mkdtempSync(path.join(tmpdir(), 'educsyn-config-school-'));
  const repository = new RepositoryConfigurationMemoire();
  const service = new ConfigurationInitialisationOfficielleService(
    new CreateConfigurationUseCase(
      repository,
      new AuditConfigurationTestDouble(),
      new MonitoringConfigurationTestDouble(),
    ),
    () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    path.join(dossierTemporaire, 'journal.json'),
  );

  const resultat = await service.amorcerEcole({
    organisationId: 'org-3',
    ecoleId: 'school-3',
  });
  const configuration = repository.stockageMemoire().lister()[0]?.configuration;

  assert.deepEqual(resultat.createdKeys, ['modules.enabled']);
  assert.deepEqual(configuration?.details().valeur, []);

  rmSync(dossierTemporaire, { recursive: true, force: true });
});
