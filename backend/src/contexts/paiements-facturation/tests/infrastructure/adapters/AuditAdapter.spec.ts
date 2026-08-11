import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditAdapter } from '../../../infrastructure/adapters/AuditAdapter';
import type { AuditEntry } from '../../../../../shared/audit/domain/aggregates';
import type { AuditCanonicalWritePort } from '../../../../../shared/audit/application/ports/outbound';
import { reinitialiserEtatAuditTests } from '../../../../../shared/audit/tests/support/AuditTestSupport';

test.beforeEach(() => {
  reinitialiserEtatAuditTests();
});

function creerRepositoryTest() {
  const entrees: AuditEntry[] = [];
  const idempotencyKeys: string[] = [];
  const writer: AuditCanonicalWritePort = {
    ecrire: async (entree, idempotencyKey) => {
      entrees.push(entree);
      idempotencyKeys.push(idempotencyKey);
      return { eventId: entree.obtenirId(), idOutbox: `outbox-${entree.obtenirId()}`, duplicate: false };
    },
  };
  return { entrees, idempotencyKeys, writer };
}

test('AuditAdapter persiste un audit shared pour un paiement enregistre', async () => {
  const testRepository = creerRepositoryTest();
  const adaptateur = new AuditAdapter(testRepository.writer);

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
  assert.equal(
    testRepository.idempotencyKeys[0],
    'PAIEMENTS:PAIEMENT_CREE:ORG-001:ECOLE-001:PAIEMENT-001',
  );
});

test('AuditAdapter persiste un audit shared pour l ouverture de caisse', async () => {
  const testRepository = creerRepositoryTest();
  const adaptateur = new AuditAdapter(testRepository.writer);

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
