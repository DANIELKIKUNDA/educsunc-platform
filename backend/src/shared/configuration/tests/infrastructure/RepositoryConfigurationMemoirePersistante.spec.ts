import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  ConfigurationId,
  CreateConfigurationUseCase,
  RepositoryConfigurationMemoirePersistante,
  RepositoryConfigurationVersionMemoire,
  UpdateConfigurationUseCase,
} from 'shared/configuration';
import {
  AuditConfigurationTestDouble,
  MonitoringConfigurationTestDouble,
} from '../support/ConfigurationTestSupport';

test('RepositoryConfigurationMemoirePersistante recharge les configurations apres redemarrage et conserve le compteur de versions', async () => {
  const dossierTemporaire = mkdtempSync(path.join(tmpdir(), 'educsyn-config-persist-'));
  const cheminFichier = path.join(dossierTemporaire, 'configurations.json');
  const audit = new AuditConfigurationTestDouble();
  const monitoring = new MonitoringConfigurationTestDouble();

  const repositoryInitial = new RepositoryConfigurationMemoirePersistante(cheminFichier);
  const createUseCase = new CreateConfigurationUseCase(repositoryInitial, audit, monitoring);

  await createUseCase.executer({
    configurationId: 'cfg-runtime-1',
    key: 'runtime.replay.enabled',
    value: true,
    scope: { niveau: 'SYSTEM' },
    actorId: 'manager-systeme',
  });

  const repositoryRecharge = new RepositoryConfigurationMemoirePersistante(cheminFichier);
  const rehydratee = await repositoryRecharge.trouverParId(ConfigurationId.creer('cfg-runtime-1'));

  assert.equal(rehydratee?.details().key, 'runtime.replay.enabled');
  assert.equal(rehydratee?.details().totalVersions, 1);
  assert.equal(rehydratee?.details().valeur, true);

  const updateUseCase = new UpdateConfigurationUseCase(
    repositoryRecharge,
    new RepositoryConfigurationVersionMemoire(),
    audit,
    monitoring,
  );
  await updateUseCase.executer({
    configurationId: 'cfg-runtime-1',
    value: false,
    actorId: 'manager-systeme',
  });

  const repositoryFinal = new RepositoryConfigurationMemoirePersistante(cheminFichier);
  const finale = await repositoryFinal.trouverParId(ConfigurationId.creer('cfg-runtime-1'));

  assert.equal(finale?.details().valeur, false);
  assert.equal(finale?.details().totalVersions, 2);

  rmSync(dossierTemporaire, { recursive: true, force: true });
});
