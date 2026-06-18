import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationSocleAcademiqueAdapter } from '../../../app/adapters/AutorisationSocleAcademiqueAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve ADM-01 aux acteurs systeme reels et laisse OPERATEUR_SYSTEME ou SUPPORT_SYSTEME dependre de leurs permissions effectives', async () => {
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
  const operateurLectureSeule = await bootstrap.creerActeur({
    codeRole: 'OPERATEUR_SYSTEME',
    permissions: ['referentiel.read'],
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

  const adaptateur = new AutorisationSocleAcademiqueAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    securityFacade: bootstrap.securityFacade,
  });

  await adaptateur.verifierLectureSocleAcademique({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });
  await adaptateur.verifierMutationSocleAcademique({
    idUtilisateur: manager.utilisateurId,
    roleActif: manager.roleCode,
  });

  await adaptateur.verifierLectureSocleAcademique({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });
  await adaptateur.verifierMutationSocleAcademique({
    idUtilisateur: operateur.utilisateurId,
    roleActif: operateur.roleCode,
  });

  await adaptateur.verifierLectureSocleAcademique({
    idUtilisateur: operateurLectureSeule.utilisateurId,
    roleActif: operateurLectureSeule.roleCode,
  });
  await assert.rejects(
    () => adaptateur.verifierMutationSocleAcademique({
      idUtilisateur: operateurLectureSeule.utilisateurId,
      roleActif: operateurLectureSeule.roleCode,
    }),
    /permission|refuse|autorise/i,
  );

  await adaptateur.verifierLectureSocleAcademique({
    idUtilisateur: supportLectureSeule.utilisateurId,
    roleActif: supportLectureSeule.roleCode,
  });
  await assert.rejects(
    () => adaptateur.verifierMutationSocleAcademique({
      idUtilisateur: supportLectureSeule.utilisateurId,
      roleActif: supportLectureSeule.roleCode,
    }),
    /permission|refuse|autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierLectureSocleAcademique({
      idUtilisateur: adminSystemeEcole.utilisateurId,
      roleActif: adminSystemeEcole.roleCode,
    }),
    /socle academique officiel|autorise/i,
  );
});
