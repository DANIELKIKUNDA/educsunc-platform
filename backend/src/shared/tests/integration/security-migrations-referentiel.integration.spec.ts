import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationMigrationReferentielAdapter } from '../../../app/adapters/AutorisationMigrationReferentielAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';
import { AutorisationSocleAcademiqueAdapter } from '../../../app/adapters/AutorisationSocleAcademiqueAdapter';

test('SECURITY reserve ACA-09 aux acteurs systeme reels et impose referentiel.read/write', async () => {
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
  const supportLectureSeule = await bootstrap.creerActeur({
    codeRole: 'SUPPORT_SYSTEME',
    permissions: ['referentiel.read'],
    niveauAcces: 'PLATEFORME',
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const autorisationSocle = new AutorisationSocleAcademiqueAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
  });
  const adaptateur = new AutorisationMigrationReferentielAdapter(autorisationSocle);

  await adaptateur.verifierLectureMigrationReferentiel({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });
  await adaptateur.verifierMutationMigrationReferentiel({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });

  await adaptateur.verifierLectureMigrationReferentiel({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });
  await adaptateur.verifierMutationMigrationReferentiel({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });

  await adaptateur.verifierLectureMigrationReferentiel({
    idUtilisateur: supportLectureSeule.utilisateurId,
    roleActif: supportLectureSeule.roleCode,
  });

  await assert.rejects(
    () => adaptateur.verifierMutationMigrationReferentiel({
      idUtilisateur: supportLectureSeule.utilisateurId,
      roleActif: supportLectureSeule.roleCode,
    }),
    /permission|refuse|autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierLectureMigrationReferentiel({
      idUtilisateur: adminSystemeEcole.utilisateurId,
      roleActif: adminSystemeEcole.roleCode,
    }),
    /socle academique officiel|autorise/i,
  );
});
