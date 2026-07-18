import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditAdapter } from '../../../infrastructure/adapters/AuditAdapter';
import type { AuditEntry } from '../../../../../shared/audit/domain/aggregates';
import type { AuditEntryRepository } from '../../../../../shared/audit/domain/repositories';
import { reinitialiserEtatAuditTests } from '../../../../../shared/audit/tests/support/AuditTestSupport';

test.beforeEach(() => {
  reinitialiserEtatAuditTests();
});

function creerRepositoryTest() {
  const entrees: AuditEntry[] = [];
  const repository: AuditEntryRepository = {
    ajouterAudit: async (entree) => { entrees.push(entree); },
    trouverParId: async (id) => entrees.find((entree) => entree.obtenirId() === id) ?? null,
    trouverParCorrelationId: async () => [],
    trouverParRequestId: async () => [],
    trouverParTenant: async () => [],
    listerSelonFiltres: async () => [...entrees],
    existe: async (id) => entrees.some((entree) => entree.obtenirId() === id),
  };
  return { entrees, repository };
}

test('AuditAdapter persiste un audit shared pour un paiement enregistre', async () => {
  const testRepository = creerRepositoryTest();
  const adaptateur = new AuditAdapter(testRepository.repository);

  await adaptateur.journaliserActionFinanciere({
    action: 'ENREGISTRER_PAIEMENT',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'USER-CAISSIER-001',
    roleActif: 'CAISSIER',
    referenceMetier: 'PAIEMENT-001',
    montant: 50000,
    devise: 'CDF',
    details: {
      idEleve: 'ELEVE-001',
      typePaiement: 'ESPECES',
    },
  });

  assert.equal(testRepository.entrees.length, 1);
  const [entree] = testRepository.entrees;
  assert.equal(entree.obtenirActionAudit().obtenirValeur(), 'PAIEMENT_CREE');
  assert.equal(entree.obtenirTypeAuditPrincipal().obtenirValeur(), 'FINANCIER');
  assert.equal(entree.obtenirTenantAudit().obtenirOrganisationId(), 'ORG-001');
  assert.equal(entree.obtenirTenantAudit().obtenirEcoleId(), 'ECOLE-001');
  assert.equal(
    entree.obtenirRessourceAudit().obtenirIdentifiantRessource().obtenirValeur(),
    'PAIEMENT-001',
  );
});

test('AuditAdapter persiste un audit shared pour l ouverture de caisse', async () => {
  const testRepository = creerRepositoryTest();
  const adaptateur = new AuditAdapter(testRepository.repository);

  await adaptateur.journaliserActionFinanciere({
    action: 'OUVRIR_CAISSE_JOUR',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'USER-CAISSIER-001',
    roleActif: 'CAISSIER',
    referenceMetier: 'CAISSE-2026-06-13',
    details: {
      dateOuverture: '2026-06-13',
    },
  });

  assert.equal(testRepository.entrees.length, 1);
  const [entree] = testRepository.entrees;
  assert.equal(entree.obtenirActionAudit().obtenirValeur(), 'CAISSE_OUVERTE');
  assert.equal(entree.obtenirTypeAuditPrincipal().obtenirValeur(), 'FINANCIER');
  assert.equal(
    entree.obtenirRessourceAudit().obtenirIdentifiantRessource().obtenirValeur(),
    'CAISSE-2026-06-13',
  );
});
