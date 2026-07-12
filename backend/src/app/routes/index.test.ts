import test from 'node:test';
import assert from 'node:assert/strict';

import { routeReferentielAcademiqueEstGouvernancePlateforme } from './index';

test('les routes plateforme de gouvernance du referentiel academique ne dependent pas d un module ecole actif', () => {
  assert.equal(routeReferentielAcademiqueEstGouvernancePlateforme('/api/organisations'), true);
  assert.equal(routeReferentielAcademiqueEstGouvernancePlateforme('/api/organisations/org-a'), true);
  assert.equal(routeReferentielAcademiqueEstGouvernancePlateforme('/api/organisations/org-a/ecoles'), true);
  assert.equal(routeReferentielAcademiqueEstGouvernancePlateforme('/api/ecoles'), true);
  assert.equal(routeReferentielAcademiqueEstGouvernancePlateforme('/api/ecoles/ecole-a-1'), true);
});

test('les routes locales ecole du referentiel academique gardent la protection modulaire', () => {
  assert.equal(
    routeReferentielAcademiqueEstGouvernancePlateforme('/api/programmes-niveau/ecole-a-1'),
    false,
  );
  assert.equal(
    routeReferentielAcademiqueEstGouvernancePlateforme('/api/calendriers/ecoles/ecole-a-1'),
    false,
  );
});
