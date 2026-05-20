import test from 'node:test';
import assert from 'node:assert/strict';
import { AttribuerTitulariatUseCase, RetirerTitulariatUseCase, SagaTitulariat } from 'shared/security/application';
import { creerSecurityAffectationService, TransactionSecurityMemoire } from '../support/SecurityTestSupport';

test('affecte titulaire et cloture le titulariat au retrait', async () => {
  const { service } = creerSecurityAffectationService();
  const transaction = new TransactionSecurityMemoire();
  const saga = new SagaTitulariat(transaction as never, service);
  const attribuer = new AttribuerTitulariatUseCase(saga);
  const retirer = new RetirerTitulariatUseCase(saga);

  const cree = await attribuer.executer({ idUtilisateur: 'u1', idClasse: 'classe-1', idAnneeScolaire: 'annee-1' });
  assert.equal(cree.estActif, true);

  const retire = await retirer.executer({ idClasse: 'classe-1', idAnneeScolaire: 'annee-1' });
  assert.equal(retire.estActif, false);
});
