import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationClassementAdapter } from '../../../app/adapters/AutorisationClassementAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY applique bien les regles locales de consultation et recalcul des classements', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const titulaire = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
    titulaireClasseId: WORKFLOW_FIXTURES.classeA,
    titulaireAnneeScolaireId: WORKFLOW_FIXTURES.anneeScolaireId,
  });
  const enseignant = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ENSEIGNANT,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    classeId: WORKFLOW_FIXTURES.classeA,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
    sectionId: WORKFLOW_FIXTURES.sectionSecondaire,
  });

  const adaptateur = new AutorisationClassementAdapter({
    async resoudreSectionClasse({ idClassePedagogique }) {
      if (idClassePedagogique === WORKFLOW_FIXTURES.classeA) {
        return WORKFLOW_FIXTURES.sectionSecondaire;
      }

      if (idClassePedagogique === WORKFLOW_FIXTURES.classeB) {
        return WORKFLOW_FIXTURES.sectionPrimaire;
      }

      return null;
    },
    async consulterResponsabiliteClassePedagogique({ idClassePedagogique, idAnneeScolaire }) {
      if (idClassePedagogique !== WORKFLOW_FIXTURES.classeA || idAnneeScolaire !== WORKFLOW_FIXTURES.anneeScolaireId) {
        return null;
      }

      return {
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
      };
    },
  });

  await adaptateur.verifierConsultationClassementClasse({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  });

  await adaptateur.verifierConsultationClassementClasse({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  });

  await adaptateur.verifierRecalculClassementClasse({
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
  });

  await assert.rejects(
    () => adaptateur.verifierRecalculClassementClasse({
      idUtilisateur: prefet.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idClassePedagogique: WORKFLOW_FIXTURES.classeA,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /autorise|permission|refuse/i,
  );

  await assert.rejects(
    () => adaptateur.verifierConsultationClassementClasse({
      idUtilisateur: enseignant.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idClassePedagogique: WORKFLOW_FIXTURES.classeA,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    }),
    /pas autorise/i,
  );

  await adaptateur.fermer();
});
