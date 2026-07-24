import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ConfigurationInitialisationOfficielleService } from '../services/ConfigurationInitialisationOfficielleService';
import {
  type Configuration,
  type ConfigurationBootstrapJournalStore,
  CreateConfigurationUseCase,
  type CreateConfigurationCommand,
  RepositoryConfigurationMemoire,
} from '../../shared/configuration';
import {
  AuditConfigurationTestDouble,
  MonitoringConfigurationTestDouble,
} from '../../shared/configuration/tests/support/ConfigurationTestSupport';

class JournalBootstrapMemoireTestDouble implements ConfigurationBootstrapJournalStore {
  public readonly entries: Array<{
    executionId: string;
    executedAt: string;
    type: string;
    scope: Record<string, unknown>;
    createdKeys: readonly string[];
    skippedKeys: readonly string[];
  }> = [];

  public async journaliser(
    entry: {
      executionId: string;
      executedAt: string;
      type: string;
      scope: Record<string, unknown>;
      createdKeys: readonly string[];
      skippedKeys: readonly string[];
    },
  ): Promise<void> {
    this.entries.push(entry);
  }
}

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

test('ConfigurationInitialisationOfficielleService initialise les cles systeme officielles avec leurs valeurs par defaut', async () => {
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

  assert.deepEqual(resultat.createdKeys, [
    'runtime.retry.maxAttempts',
    'runtime.replay.enabled',
    'runtime.cache.ttlSeconds',
    'notifications.providers.in_app.enabled',
    'notifications.providers.sms.enabled',
    'notifications.providers.email.enabled',
    'notifications.providers.whatsapp.enabled',
    'notifications.providers.push.enabled',
    'notifications.providers.webhook.enabled',
    'notifications.retry.enabled',
    'notifications.retry.maxAttempts',
    'notifications.retry.defaultBackoffMs',
    'notifications.replay.enabled',
    'notifications.replay.batchSize',
  ]);
  assert.deepEqual(resultat.skippedKeys, []);
  assert.equal(repository.stockageMemoire().lister().length, 14);
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

test("ConfigurationInitialisationOfficielleService initialise les preferences officielles du premier usage utilisateur", async () => {
  const dossierTemporaire = mkdtempSync(path.join(tmpdir(), 'educsyn-config-user-'));
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

  const resultat = await service.amorcerUtilisateur({
    organisationId: 'org-user',
    ecoleId: 'school-user',
    utilisateurId: 'user-1',
  });
  const configurations = repository.stockageMemoire().lister().map((entry) => entry.configuration.details());

  assert.deepEqual(resultat.createdKeys, [
    'preferences.theme',
    'notifications.preferences.muted',
    'notifications.preferences.preferredChannel',
    'notifications.preferences.enabledChannels',
  ]);
  assert.equal(configurations.find((entry) => entry.key === 'preferences.theme')?.valeur, 'system');
  assert.deepEqual(
    configurations.find((entry) => entry.key === 'notifications.preferences.enabledChannels')?.valeur,
    ['IN_APP', 'EMAIL'],
  );

  rmSync(dossierTemporaire, { recursive: true, force: true });
});

test("ConfigurationInitialisationOfficielleService initialise aussi un compte plateforme sans ecole", async () => {
  const repository = new RepositoryConfigurationMemoire();
  const service = new ConfigurationInitialisationOfficielleService(
    new CreateConfigurationUseCase(
      repository,
      new AuditConfigurationTestDouble(),
      new MonitoringConfigurationTestDouble(),
    ),
    () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    path.join(mkdtempSync(path.join(tmpdir(), 'educsyn-config-platform-user-')), 'journal.json'),
  );

  const resultat = await service.amorcerUtilisateur({
    utilisateurId: 'manager-systeme-1',
  });
  const themes = repository.stockageMemoire().lister()
    .map((entry) => entry.configuration.details())
    .filter((entry) => entry.key === 'preferences.theme');

  assert.equal(resultat.createdKeys.includes('preferences.theme'), true);
  assert.equal(themes.length, 1);
  assert.deepEqual(themes[0]?.scope, {
    niveau: 'USER',
    utilisateurId: 'manager-systeme-1',
  });
});

test("ConfigurationInitialisationOfficielleService ne duplique pas les preferences quand le contexte utilisateur change", async () => {
  const repository = new RepositoryConfigurationMemoire();
  const service = new ConfigurationInitialisationOfficielleService(
    new CreateConfigurationUseCase(
      repository,
      new AuditConfigurationTestDouble(),
      new MonitoringConfigurationTestDouble(),
    ),
    () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
  );

  await service.amorcerUtilisateur({
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
    utilisateurId: 'user-mobile-1',
  });
  const secondPassage = await service.amorcerUtilisateur({
    organisationId: 'org-2',
    ecoleId: 'ecole-2',
    utilisateurId: 'user-mobile-1',
  });

  assert.deepEqual(secondPassage.createdKeys, []);
  assert.equal(repository.stockageMemoire().lister().length, 4);
});

test("ConfigurationInitialisationOfficielleService resiste a deux premiers usages utilisateur concurrents", async () => {
  const configurations = new Map<string, CreateConfigurationCommand>();
  const creationsEnCours = new Map<string, Promise<void>>();
  const serviceCreationConcurrent = {
    async executer(commande: CreateConfigurationCommand) {
      const identifiant = `${commande.scope.niveau}:${commande.scope.utilisateurId}:${commande.key}`;
      const creationExistante = creationsEnCours.get(identifiant);
      if (creationExistante) {
        await creationExistante;
        throw new Error('Contrainte unique simulee.');
      }

      let terminerCreation!: () => void;
      const creation = new Promise<void>((resolve) => {
        terminerCreation = resolve;
      });
      creationsEnCours.set(identifiant, creation);
      await new Promise<void>((resolve) => setImmediate(resolve));
      configurations.set(identifiant, commande);
      terminerCreation();
      creationsEnCours.delete(identifiant);
      return {} as never;
    },
  } as unknown as CreateConfigurationUseCase;
  const listerConfigurations = (): readonly Configuration[] =>
    [...configurations.values()].map((commande) => ({
      details: () => ({
        key: commande.key,
        scope: commande.scope,
      }),
    })) as unknown as readonly Configuration[];
  const journal = new JournalBootstrapMemoireTestDouble();
  const service = new ConfigurationInitialisationOfficielleService(
    serviceCreationConcurrent,
    listerConfigurations,
    undefined,
    journal,
  );

  const [premierAcces, secondAcces] = await Promise.all([
    service.amorcerUtilisateur({ utilisateurId: 'user-concurrent' }),
    service.amorcerUtilisateur({ utilisateurId: 'user-concurrent' }),
  ]);

  assert.equal(configurations.size, 4);
  assert.equal(premierAcces.createdKeys.length + secondAcces.createdKeys.length, 4);
  assert.equal(premierAcces.skippedKeys.length + secondAcces.skippedKeys.length, 4);
});

test('ConfigurationInitialisationOfficielleService supporte un lister asynchrone et journalise via un store externe', async () => {
  const repository = new RepositoryConfigurationMemoire();
  const journal = new JournalBootstrapMemoireTestDouble();
  const service = new ConfigurationInitialisationOfficielleService(
    new CreateConfigurationUseCase(
      repository,
      new AuditConfigurationTestDouble(),
      new MonitoringConfigurationTestDouble(),
    ),
    async () => repository.stockageMemoire().lister().map((entry) => entry.configuration),
    undefined,
    journal,
  );

  const resultat = await service.amorcerSysteme();

  assert.equal(resultat.createdKeys.length, 14);
  assert.equal(journal.entries.length, 1);
  assert.equal(journal.entries[0]?.type, 'BOOTSTRAP_SYSTEME');
  assert.equal(journal.entries[0]?.createdKeys.length, 14);
});
