import test from 'node:test';
import assert from 'node:assert/strict';
import { AffectationUtilisateurController } from 'shared/security/interfaces/http/controllers';

test('affectation utilisateur, retrait scope et lecture affectations passent par le controller', async () => {
  const controller = new AffectationUtilisateurController(
    { executer: async () => ({ idAffectationUtilisateur: 'a1', idUtilisateur: 'u1', idRole: 'role-1', niveauAcces: 'ECOLE', etatAffectation: 'ACTIVE', idOrganisation: 'org-1', idEcole: 'ecole-1' }) } as never,
    { executer: async () => ({ idAffectationUtilisateur: 'a1', idUtilisateur: 'u1', idRole: 'role-1', niveauAcces: 'ECOLE', etatAffectation: 'ACTIVE', idOrganisation: 'org-1', idEcole: 'ecole-1' }) } as never,
    { executer: async () => ({ idAffectationUtilisateur: 'a1', idUtilisateur: 'u1', idRole: 'role-1', niveauAcces: 'ECOLE', etatAffectation: 'INACTIVE', idOrganisation: 'org-1', idEcole: 'ecole-1' }) } as never,
    { executer: async () => ([{ typeScope: 'ECOLE', valeurScope: 'ecole-1', estLectureSeule: false }]) } as never,
    { executer: async () => ([] as const) } as never,
    { executer: async () => ([{ idAffectationUtilisateur: 'a1', idUtilisateur: 'u1', idRole: 'role-1', niveauAcces: 'ECOLE', etatAffectation: 'ACTIVE' }]) } as never,
    { executer: async () => ([{ typeScope: 'ECOLE', valeurScope: 'ecole-1', estLectureSeule: false }]) } as never,
  );

  assert.equal(((await controller.creer({ idUtilisateur: 'u1', idRole: 'role-1', niveauAcces: 'ECOLE' })).donnee as any).success, true);
  assert.equal(((await controller.retirerScope('a1', 'ECOLE', 'ecole-1')).donnee as any).success, true);
  assert.equal(((await controller.listerAffectations('u1')).donnee as any).success, true);
});
