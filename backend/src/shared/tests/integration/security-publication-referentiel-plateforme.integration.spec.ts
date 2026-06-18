import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationPublicationReferentielAdapter } from '../../../app/adapters/AutorisationPublicationReferentielAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve PLT-01 a MANAGER_SYSTEME et autorise OPERATEUR_SYSTEME seulement si la delegation explicite est active', async () => {
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

  const adaptateurSansDelegation = new AutorisationPublicationReferentielAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: false,
  });
  const adaptateurAvecDelegation = new AutorisationPublicationReferentielAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
    autoriserOperateur: true,
  });

  await adaptateurSansDelegation.verifierMutationPublicationReferentiel({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });

  await assert.rejects(
    () => adaptateurSansDelegation.verifierMutationPublicationReferentiel({
      idUtilisateur: operateur.utilisateurId,
      roleActif: operateur.roleCode,
    }),
    /publier une version officielle du referentiel|autorise/i,
  );

  await adaptateurAvecDelegation.verifierMutationPublicationReferentiel({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierMutationPublicationReferentiel({
      idUtilisateur: support.utilisateurId,
      roleActif: support.roleCode,
    }),
    /publier une version officielle du referentiel|autorise/i,
  );

  await assert.rejects(
    () => adaptateurAvecDelegation.verifierMutationPublicationReferentiel({
      idUtilisateur: adminSystemeEcole.utilisateurId,
      roleActif: adminSystemeEcole.roleCode,
    }),
    /publier une version officielle du referentiel|autorise/i,
  );
});
