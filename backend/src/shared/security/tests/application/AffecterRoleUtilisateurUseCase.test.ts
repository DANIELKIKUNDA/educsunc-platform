import test from 'node:test';
import assert from 'node:assert/strict';
import { CreerAffectationUtilisateurUseCase, SagaAffectationUtilisateur } from 'shared/security/application';
import { creerSecurityAffectationService, TransactionSecurityMemoire } from '../support/SecurityTestSupport';

test('affecte role utilisateur avec scope organisation et ecole', async () => {
  const { service } = creerSecurityAffectationService();
  const transaction = new TransactionSecurityMemoire();
  const useCase = new CreerAffectationUtilisateurUseCase(new SagaAffectationUtilisateur(transaction as never, service));

  const resultat = await useCase.executer({
    idUtilisateur: 'u1',
    idRole: 'role-1',
    niveauAcces: 'ECOLE',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    creePar: 'tests',
  });

  assert.equal(resultat.idUtilisateur, 'u1');
  assert.equal(resultat.niveauAcces, 'ECOLE');
  assert.equal(transaction.nombreTransactions, 1);
});
