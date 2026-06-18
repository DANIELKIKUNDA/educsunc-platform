import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationLectureReferentielAdapter } from '../../../app/adapters/AutorisationLectureReferentielAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve PLT-05 a MANAGER_SYSTEME et autorise OPERATEUR_SYSTEME seulement si la delegation explicite est active', async () => {
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

  const adaptateurSansDelegation = new AutorisationLectureReferentielAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: false,
  });
  const adaptateurAvecDelegation = new AutorisationLectureReferentielAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: true,
  });

  await adaptateurSansDelegation.verifierLectureReferentiel({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });

  await assert.rejects(
    () => adaptateurSansDelegation.verifierLectureReferentiel({
      idUtilisateur: operateur.utilisateurId,
      roleActif: operateur.roleCode,
    }),
    /consulter les referentiels officiels|autorise/i,
  );

  await adaptateurAvecDelegation.verifierLectureReferentiel({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierLectureReferentiel({
      idUtilisateur: support.utilisateurId,
      roleActif: support.roleCode,
    }),
    /consulter les referentiels officiels|autorise/i,
  );

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierLectureReferentiel({
      idUtilisateur: adminSystemeEcole.utilisateurId,
      roleActif: adminSystemeEcole.roleCode,
    }),
    /consulter les referentiels officiels|autorise/i,
  );
});
