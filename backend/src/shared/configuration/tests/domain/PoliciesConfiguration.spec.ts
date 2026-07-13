import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ConfigurationKey,
  PolitiqueClassificationConfiguration,
  ConfigurationScope,
  ConfigurationValue,
  PolitiqueOverrideConfiguration,
  PolitiqueValidationConfiguration,
} from 'shared/configuration';
import { FIXTURE_SCOPE_ECOLE, FIXTURE_SCOPE_SYSTEME, FIXTURE_SCOPE_UTILISATEUR } from '../fixtures/ConfigurationFixtures';

test('la politique d override autorise une surcharge descendante non verrouillee', () => {
  const politique = new PolitiqueOverrideConfiguration();

  assert.equal(
    politique.autoriser(
      ConfigurationScope.creer(FIXTURE_SCOPE_SYSTEME),
      ConfigurationScope.creer(FIXTURE_SCOPE_ECOLE),
      false,
    ),
    true,
  );
});

test('la politique de validation remonte un warning sur une cle runtime textuelle', () => {
  const politique = new PolitiqueValidationConfiguration();
  const warnings = politique.valider(
    ConfigurationKey.creer('runtime.mode'),
    ConfigurationValue.creer('texte'),
  );

  assert.equal(warnings.length > 0, true);
});

test('la classification impose le proprietaire runtime plateforme', () => {
  const politique = new PolitiqueClassificationConfiguration();
  const regle = politique.classifier('runtime.cache.ttlSeconds', 'SYSTEM');

  assert.equal(regle.famille, 'CFG-PLAT-RUNTIME');
  assert.equal(regle.proprietaireNiveau, 'SYSTEM');
  assert.equal(regle.overridableParDefaut, false);
});

test('la classification reserve les notifications globales au niveau plateforme', () => {
  const politique = new PolitiqueClassificationConfiguration();
  const regle = politique.classifier('notifications.retry.enabled', 'SYSTEM');

  assert.equal(regle.famille, 'CFG-PLAT-NOTIFICATIONS');
  assert.equal(regle.proprietaireNiveau, 'SYSTEM');
});

test('la classification reserve les preferences utilisateur au proprietaire cible', () => {
  const politique = new PolitiqueClassificationConfiguration();

  assert.equal(
    politique.autoriserRole(
      'WRITE',
      'UTILISATEUR_CONFIGURATION',
      'preferences.theme',
      'USER',
      {
        utilisateurId: FIXTURE_SCOPE_UTILISATEUR.utilisateurId,
        cibleUtilisateurId: FIXTURE_SCOPE_UTILISATEUR.utilisateurId,
      },
    ),
    true,
  );
  assert.equal(
    politique.autoriserRole(
      'WRITE',
      'UTILISATEUR_CONFIGURATION',
      'preferences.theme',
      'USER',
      {
        utilisateurId: 'user-autre',
        cibleUtilisateurId: FIXTURE_SCOPE_UTILISATEUR.utilisateurId,
      },
    ),
    false,
  );
  assert.equal(
    politique.autoriserRole(
      'WRITE',
      'UTILISATEUR_CONFIGURATION',
      'notifications.preferences.muted',
      'USER',
      {
        utilisateurId: FIXTURE_SCOPE_UTILISATEUR.utilisateurId,
        cibleUtilisateurId: FIXTURE_SCOPE_UTILISATEUR.utilisateurId,
      },
    ),
    true,
  );
});
