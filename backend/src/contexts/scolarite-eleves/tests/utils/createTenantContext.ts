import { ScolariteTenantContext } from '../../infrastructure/tenancy/ScolariteTenantContext';
import { idsScolariteTest } from '../fixtures/eleves.fixture';

// Ce fichier cree un contexte tenant de test.
export function creerTenantScolariteTest(): ScolariteTenantContext {
  const contexte = new ScolariteTenantContext();
  contexte.definirEcoleCourante(idsScolariteTest.idOrganisation, idsScolariteTest.idEcole);
  return contexte;
}
