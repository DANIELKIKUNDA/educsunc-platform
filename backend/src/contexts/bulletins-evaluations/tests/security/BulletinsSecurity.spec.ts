import test from 'node:test';
import assert from 'node:assert/strict';
import { ContexteTenant } from 'shared/tenancy/TenantContext';
import { SecurityValidator } from 'contexts/bulletins-evaluations/interfaces/http/validators/SecurityValidator';
import { appliquerTenantDepuisRequete } from 'contexts/bulletins-evaluations/interfaces/http/routes/outilsRoutesBulletins';

// Ce fichier couvre les gardes de securite pragmatiques deja presentes dans le BC.
test('les informations de securite et de tenant sont isolees proprement', () => {
  const securite = SecurityValidator.valider({
    'x-user-id': 'user-1',
    'x-role': 'PREFET',
    'x-scope': 'lecture',
  });
  assert.equal(securite.idUtilisateur, 'user-1');

  const contexte = new ContexteTenant();
  appliquerTenantDepuisRequete({
    headers: {
      'x-tenant-id': 'ecole-7',
      'x-organisation-id': 'org-7',
      'x-lecture-organisationnelle': 'true',
    },
  } as never, contexte);
  assert.equal(contexte.obtenirOrganisation(), 'org-7');
  assert.equal(contexte.estEnLectureOrganisationnelle(), true);
});
