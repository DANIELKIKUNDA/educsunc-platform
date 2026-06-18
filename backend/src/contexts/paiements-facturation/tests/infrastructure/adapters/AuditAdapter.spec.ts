import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditAdapter } from '../../../infrastructure/adapters/AuditAdapter';
import { obtenirMemoireAuditStore } from '../../../../../shared/audit/infrastructure/persistence/postgres/repositories/_memoireAuditStore';
import { reinitialiserEtatAuditTests } from '../../../../../shared/audit/tests/support/AuditTestSupport';

test.beforeEach(() => {
  reinitialiserEtatAuditTests();
});

test('AuditAdapter persiste un audit shared pour un paiement enregistre', async () => {
  const adaptateur = new AuditAdapter();

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

  const store = obtenirMemoireAuditStore();
  assert.equal(store.auditEntries.size, 1);

  const [entree] = [...store.auditEntries.values()];
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
  const adaptateur = new AuditAdapter();

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

  const store = obtenirMemoireAuditStore();
  assert.equal(store.auditEntries.size, 1);

  const [entree] = [...store.auditEntries.values()];
  assert.equal(entree.obtenirActionAudit().obtenirValeur(), 'CAISSE_OUVERTE');
  assert.equal(entree.obtenirTypeAuditPrincipal().obtenirValeur(), 'FINANCIER');
  assert.equal(
    entree.obtenirRessourceAudit().obtenirIdentifiantRessource().obtenirValeur(),
    'CAISSE-2026-06-13',
  );
});
