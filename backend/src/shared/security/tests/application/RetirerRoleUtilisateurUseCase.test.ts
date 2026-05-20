import test from 'node:test';
import assert from 'node:assert/strict';
import { CreerAffectationUtilisateurUseCase, DesactiverAffectationUseCase, SagaAffectationUtilisateur } from 'shared/security/application';
import { creerSecurityAffectationService, TransactionSecurityMemoire } from '../support/SecurityTestSupport';

test('desactive affectation utilisateur et journalise la transaction', async () => {
  const { service } = creerSecurityAffectationService();
  const transaction = new TransactionSecurityMemoire();
  const saga = new SagaAffectationUtilisateur(transaction as never, service);
  const creerUseCase = new CreerAffectationUtilisateurUseCase(saga);
  const desactiverUseCase = new DesactiverAffectationUseCase(saga);

  const creee = await creerUseCase.executer({
    idUtilisateur: 'u1',
    idRole: 'role-1',
    niveauAcces: 'ECOLE',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });

  const resultat = await desactiverUseCase.executer({ idAffectationUtilisateur: creee.idAffectationUtilisateur });
  assert.equal(resultat.etatAffectation, 'INACTIVE');
  assert.equal(transaction.nombreTransactions >= 2, true);
});
