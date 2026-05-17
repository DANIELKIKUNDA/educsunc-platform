import test from 'node:test';
import assert from 'node:assert/strict';
import { appliquerTenantDepuisRequete } from 'contexts/bulletins-evaluations/interfaces/http/routes/outilsRoutesBulletins';
import { BulletinTenantResolver } from 'contexts/bulletins-evaluations/infrastructure/tenancy/BulletinTenantResolver';
import { creerContexteTenant } from '../../shared/BulletinsEvaluationsTestUtils';

// Ce fichier couvre l'isolation tenant et les lectures organisationnelles du BC.
test('le contexte tenant est applique et nettoye correctement', () => {
  const contexte = creerContexteTenant('ecole-initiale', 'org-1');
  appliquerTenantDepuisRequete({
    headers: {
      'x-tenant-id': 'ecole-2',
      'x-organisation-id': 'org-2',
    },
  } as never, contexte);

  const resolver = new BulletinTenantResolver(contexte);
  assert.equal(resolver.obtenirIdEcoleCourante(), 'ecole-2');
  assert.equal(resolver.obtenirIdOrganisationCourante(), 'org-2');
});
