import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationComparaisonReferentielAdapter } from '../../../app/adapters/AutorisationComparaisonReferentielAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve PLT-04 a MANAGER_SYSTEME et autorise OPERATEUR_SYSTEME seulement si la delegation explicite est active', async () => {
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

  const adaptateurSansDelegation = new AutorisationComparaisonReferentielAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: false,
  });
  const adaptateurAvecDelegation = new AutorisationComparaisonReferentielAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: true,
  });

  await adaptateurSansDelegation.verifierLectureComparaisonReferentiel({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });

  await assert.rejects(
    () => adaptateurSansDelegation.verifierLectureComparaisonReferentiel({
      idUtilisateur: operateur.utilisateurId,
      roleActif: operateur.roleCode,
    }),
    /comparer des versions officielles du referentiel|autorise/i,
  );

  await adaptateurAvecDelegation.verifierLectureComparaisonReferentiel({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierLectureComparaisonReferentiel({
      idUtilisateur: support.utilisateurId,
      roleActif: support.roleCode,
    }),
    /comparer des versions officielles du referentiel|autorise/i,
  );

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierLectureComparaisonReferentiel({
      idUtilisateur: adminSystemeEcole.utilisateurId,
      roleActif: adminSystemeEcole.roleCode,
    }),
    /comparer des versions officielles du referentiel|autorise/i,
  );
});
