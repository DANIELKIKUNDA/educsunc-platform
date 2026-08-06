import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationLectureBulletinAdapter } from '../../../app/adapters/AutorisationLectureBulletinAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY autorise un parent uniquement sur le bulletin de son enfant relie', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const parent = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PARENT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateur = new AutorisationLectureBulletinAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    titulariatRepository: bootstrap.securityRepositories.titulariatRepository,
    auditSecurityPort: { journaliser: async () => undefined },
    async consulterFamilleEleve(idEleve) {
      if (idEleve === WORKFLOW_FIXTURES.eleveA) {
        return {
          idFamille: 'famille-a',
          idEcole: TENANT_FIXTURES.ecoleA1,
          responsables: [{
            idResponsableFamille: 'responsable-a',
            idUtilisateurAuth: parent.utilisateurId,
            estPrincipal: true,
          }],
        };
      }

      return {
        idFamille: 'famille-b',
        idEcole: TENANT_FIXTURES.ecoleA1,
        responsables: [{
          idResponsableFamille: 'responsable-b',
          idUtilisateurAuth: 'autre-parent',
          estPrincipal: true,
        }],
      };
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierLectureBulletin({
    idUtilisateur: parent.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await assert.rejects(
    () => adaptateur.verifierLectureBulletin({
      idUtilisateur: parent.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idEleve: WORKFLOW_FIXTURES.eleveB,
      idClassePedagogique: WORKFLOW_FIXTURES.classeA,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /parent.*pas autorise/i,
  );

  await adaptateur.fermer();
});

test('SECURITY limite la lecture de bulletin au titulaire reel et au superviseur de la bonne section', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
  });
  const enseignantSimple = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  } as never);
  const administrateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const responsabiliteTitulaire = {
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idClasseAcademique: 'classe-acad-a',
    idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
    sectionCode: 'SECONDAIRE',
    sectionLibelle: 'Secondaire',
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    idUtilisateurEnseignant: titulaire.utilisateurId,
    active: true,
  } as const;

  const adaptateur = new AutorisationLectureBulletinAdapter({
    roleRepository: bootstrap.securityRepositories.roleRepository,
    affectationRepository: bootstrap.securityRepositories.affectationRepository,
    titulariatRepository: bootstrap.securityRepositories.titulariatRepository,
    auditSecurityPort: { journaliser: async () => undefined },
    responsabiliteClassePedagogiquePort: {
      async consulterActiveParClasseEtAnnee({ idClassePedagogique, idAnneeScolaire }) {
        if (
          idClassePedagogique !== WORKFLOW_FIXTURES.classeA
          || idAnneeScolaire !== WORKFLOW_FIXTURES.anneeScolaireId
        ) {
          return null;
        }
        return responsabiliteTitulaire;
      },
      async listerActivesParUtilisateur({ idUtilisateur }) {
        return idUtilisateur === titulaire.utilisateurId
          ? [responsabiliteTitulaire]
          : [];
      },
    },
    async resoudreSectionClasse({ idClassePedagogique, idAnneeScolaire }) {
      if (idClassePedagogique !== WORKFLOW_FIXTURES.classeA || idAnneeScolaire !== WORKFLOW_FIXTURES.anneeScolaireId) {
        return null;
      }

      return {
        idSectionScolaire: WORKFLOW_FIXTURES.sectionSecondaire,
        sectionCode: 'SECONDAIRE',
        sectionLibelle: 'Secondaire',
      };
    },
  });

  await assert.doesNotReject(() => adaptateur.verifierLectureBulletin({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await assert.doesNotReject(() => adaptateur.verifierLectureBulletin({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idEleve: WORKFLOW_FIXTURES.eleveA,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  }));

  await assert.rejects(
    () => adaptateur.verifierLectureBulletin({
      idUtilisateur: administrateur.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idEleve: WORKFLOW_FIXTURES.eleveA,
      idClassePedagogique: WORKFLOW_FIXTURES.classeA,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierLectureBulletin({
      idUtilisateur: enseignantSimple.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idEleve: WORKFLOW_FIXTURES.eleveA,
      idClassePedagogique: WORKFLOW_FIXTURES.classeA,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => adaptateur.verifierLectureBulletin({
      idUtilisateur: prefet.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idEleve: WORKFLOW_FIXTURES.eleveA,
      idClassePedagogique: WORKFLOW_FIXTURES.classeB,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise|introuvable/i,
  );

  await adaptateur.fermer();
});
