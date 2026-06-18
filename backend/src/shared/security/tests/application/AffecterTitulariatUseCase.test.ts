import test from 'node:test';
import assert from 'node:assert/strict';
import { AttribuerTitulariatUseCase, RetirerTitulariatUseCase, SagaTitulariat } from 'shared/security/application';
import {
  creerAffectationUtilisateur,
  creerRole,
  creerSecurityAffectationService,
  TransactionSecurityMemoire,
} from '../support/SecurityTestSupport';

test('affecte titulaire et cloture le titulariat au retrait', async () => {
  const { service, repositories } = creerSecurityAffectationService();
  const transaction = new TransactionSecurityMemoire();
  const saga = new SagaTitulariat(transaction as never, service);
  const attribuer = new AttribuerTitulariatUseCase(saga);
  const retirer = new RetirerTitulariatUseCase(saga);
  const role = creerRole({ codeRole: 'ENSEIGNANT', permissions: ['cotes.write', 'bulletins.read'] });
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'u1',
    idRole: role.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));

  const cree = await attribuer.executer({
    idUtilisateur: 'u1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  assert.equal(cree.estActif, true);
  assert.equal(cree.idOrganisation, 'org-1');
  assert.equal(cree.idEcole, 'ecole-1');

  const retire = await retirer.executer({ idClasse: 'classe-1', idAnneeScolaire: 'annee-1' });
  assert.equal(retire.estActif, false);
});
