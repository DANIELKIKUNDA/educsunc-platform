import test from 'node:test';
import assert from 'node:assert/strict';
import { SagaAffectationUtilisateur } from 'shared/security/application';
import { creerSecurityAffectationService, TransactionSecurityMemoire } from '../support/SecurityTestSupport';

test('affectation complete passe par la transaction et produit une notification utile au besoin', async () => {
  const { service } = creerSecurityAffectationService();
  const transaction = new TransactionSecurityMemoire();
  const saga = new SagaAffectationUtilisateur(transaction as never, service);

  const resultat = await saga.creerAffectation({
    idUtilisateur: 'u1',
    idRole: 'role-1',
    niveauAcces: 'ECOLE',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });

  assert.ok(resultat.idAffectationUtilisateur);
  assert.equal(transaction.nombreTransactions, 1);
});
