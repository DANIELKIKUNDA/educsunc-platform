import test from 'node:test';
import assert from 'node:assert/strict';
import { ScolariteTenantContext } from '../../../infrastructure/tenancy/ScolariteTenantContext';
import { ErreurTenantApplication } from '../../../application/exceptions/ErreurTenantApplication';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('ScolariteTenantContext accepte une ecriture dans la meme ecole', () => {
  const contexte = new ScolariteTenantContext();
  contexte.definirEcoleCourante(idsScolariteTest.idOrganisation, idsScolariteTest.idEcole);
  assert.doesNotThrow(() => contexte.verifierEcritureAutorisee(idsScolariteTest.idOrganisation, idsScolariteTest.idEcole));
});

test('ScolariteTenantContext refuse une autre ecole', () => {
  const contexte = new ScolariteTenantContext();
  contexte.definirEcoleCourante(idsScolariteTest.idOrganisation, idsScolariteTest.idEcole);
  assert.throws(() => contexte.verifierEcritureAutorisee(idsScolariteTest.idOrganisation, 'autre-ecole'), ErreurTenantApplication);
});
