import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CreateConfigurationUseCase,
  RepositoryConfigurationMemoire,
  RepositoryConfigurationVersionMemoire,
  UpdateConfigurationUseCase,
  type EffectiveConfigurationReadModel,
} from '../../shared/configuration';
import {
  AuditConfigurationTestDouble,
  MonitoringConfigurationTestDouble,
} from '../../shared/configuration/tests/support/ConfigurationTestSupport';
import { ConfigurationInitialisationOfficielleService } from '../services/ConfigurationInitialisationOfficielleService';
import { ConfigurationPreferencesUtilisateurService } from '../services/ConfigurationPreferencesUtilisateurService';

function creerEnvironnement() {
  const repository = new RepositoryConfigurationMemoire();
  const audit = new AuditConfigurationTestDouble();
  const monitoring = new MonitoringConfigurationTestDouble();
  const lister = async () => repository.stockageMemoire().lister().map((entry) => entry.configuration);
  const createUseCase = new CreateConfigurationUseCase(repository, audit, monitoring);
  const initialisation = new ConfigurationInitialisationOfficielleService(
    createUseCase,
    lister,
  );
  const effectiveReadModel: EffectiveConfigurationReadModel = {
    async trouver(scope, keyPrefix) {
      const configurations = await lister();
      const valeurs = configurations.flatMap((configuration) => {
        const details = configuration.details();
        if (
          details.scope.niveau !== scope.niveau
          || details.scope.utilisateurId !== scope.utilisateurId
          || (keyPrefix && !details.key.startsWith(keyPrefix))
        ) {
          return [];
        }
        return [{
          key: details.key,
          value: details.valeur,
          sourceNiveau: details.scope.niveau,
          herite: false,
          verrouille: details.lock !== null,
          explanation: 'Preference du compte',
        }];
      });
      return { scope, valeurs };
    },
  };
  const service = new ConfigurationPreferencesUtilisateurService(
    initialisation,
    lister,
    effectiveReadModel,
    new UpdateConfigurationUseCase(
      repository,
      new RepositoryConfigurationVersionMemoire(),
      audit,
      monitoring,
    ),
  );

  return { service, repository, audit };
}

test('le theme d un compte plateforme est initialise puis relu sans contexte ecole', async () => {
  const { service, repository } = creerEnvironnement();

  const theme = await service.lireTheme({ utilisateurId: 'manager-systeme-1' });

  assert.equal(theme, 'system');
  assert.equal(repository.stockageMemoire().lister().length, 4);
});

test('le theme utilisateur est mis a jour, audite et relu durablement', async () => {
  const { service, audit } = creerEnvironnement();

  await service.enregistrerTheme({ utilisateurId: 'manager-systeme-1' }, 'dark');
  const theme = await service.lireTheme({ utilisateurId: 'manager-systeme-1' });

  assert.equal(theme, 'dark');
  assert.equal(audit.appels.length >= 5, true);
});

test('une valeur de theme inconnue est refusee sans modifier la preference', async () => {
  const { service } = creerEnvironnement();
  await service.lireTheme({ utilisateurId: 'manager-systeme-1' });

  await assert.rejects(
    () => service.enregistrerTheme({ utilisateurId: 'manager-systeme-1' }, 'bleu'),
    /clair, sombre ou adapte/,
  );
  assert.equal(await service.lireTheme({ utilisateurId: 'manager-systeme-1' }), 'system');
});
