import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationOrganisationSystemeAdapter } from '../../../app/adapters/AutorisationOrganisationSystemeAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve ORG-01 a MANAGER_SYSTEME et autorise OPERATEUR_SYSTEME seulement si la delegation explicite est active', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const manager = await bootstrap.creerActeur({
    codeRole: 'MANAGER_SYSTEME',
    permissions: ['referentiel.read', 'referentiel.write'],
    niveauAcces: 'PLATEFORME',
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const operateur = await bootstrap.creerActeur({
    codeRole: 'OPERATEUR_SYSTEME',
    permissions: ['referentiel.read', 'referentiel.write'],
    niveauAcces: 'PLATEFORME',
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const support = await bootstrap.creerActeur({
    codeRole: 'SUPPORT_SYSTEME',
    permissions: ['referentiel.read', 'referentiel.write'],
    niveauAcces: 'PLATEFORME',
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateurSansDelegation = new AutorisationOrganisationSystemeAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: false,
  });
  const adaptateurAvecDelegation = new AutorisationOrganisationSystemeAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: true,
  });

  await adaptateurSansDelegation.verifierLectureOrganisation({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });
  await adaptateurSansDelegation.verifierMutationOrganisation({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });

  await assert.rejects(
    () => adaptateurSansDelegation.verifierLectureOrganisation({
      idUtilisateur: operateur.utilisateurId,
      roleActif: operateur.roleCode,
    }),
    /administrer les organisations|autorise/i,
  );

  await adaptateurAvecDelegation.verifierLectureOrganisation({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });
  await adaptateurAvecDelegation.verifierMutationOrganisation({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierLectureOrganisation({
      idUtilisateur: support.utilisateurId,
      roleActif: support.roleCode,
    }),
    /administrer les organisations|autorise/i,
  );

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierLectureOrganisation({
      idUtilisateur: adminSystemeEcole.utilisateurId,
      roleActif: adminSystemeEcole.roleCode,
    }),
    /administrer les organisations|autorise/i,
  );
});
