import test from 'node:test';
import assert from 'node:assert/strict';
import { CreerAffectationUtilisateurUseCase, SagaAffectationUtilisateur } from 'shared/security/application';
import { creerSecurityAffectationService, TransactionSecurityMemoire } from '../support/SecurityTestSupport';

test('affectations simultanees et changements scopes concurrents passent sans corruption technique', async () => {
  const { service, repositories } = creerSecurityAffectationService();
  const transaction = new TransactionSecurityMemoire();
  const useCase = new CreerAffectationUtilisateurUseCase(new SagaAffectationUtilisateur(transaction as never, service));

  await Promise.all([
    useCase.executer({ idUtilisateur: 'u1', idRole: 'role-1', niveauAcces: 'ECOLE', idOrganisation: 'org-1', idEcole: 'ecole-1' }),
    useCase.executer({ idUtilisateur: 'u2', idRole: 'role-2', niveauAcces: 'ECOLE', idOrganisation: 'org-1', idEcole: 'ecole-1' }),
  ]);

  assert.equal((await repositories.affectationRepository.listerActivesParUtilisateur('u1')).length, 1);
  assert.equal((await repositories.affectationRepository.listerActivesParUtilisateur('u2')).length, 1);
});
