import assert from 'node:assert/strict';
import test from 'node:test';
import { ConsulterDiagnosticsResultatUseCase } from '../../../contexts/bulletins-evaluations/application/use-cases/ConsulterDiagnosticsResultat/ConsulterDiagnosticsResultatUseCase';
import { ConsulterNonClassesUseCase } from '../../../contexts/bulletins-evaluations/application/use-cases/ConsulterNonClasses/ConsulterNonClassesUseCase';
import { ConsulterResultatEleveUseCase } from '../../../contexts/bulletins-evaluations/application/use-cases/ConsulterResultatEleve/ConsulterResultatEleveUseCase';
import { CodeColonneBulletin } from '../../../contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { AutorisationConsultationStatistiquesAdapter } from '../../../app/adapters/AutorisationConsultationStatistiquesAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES, WORKFLOW_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY applique bien les regles locales de consultation des resultats', async () => {
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

  const adaptateur = new AutorisationConsultationStatistiquesAdapter({
    async resoudreSectionClasse({ idClassePedagogique }) {
      if (idClassePedagogique === WORKFLOW_FIXTURES.classeA) {
        return WORKFLOW_FIXTURES.sectionSecondaire;
      }

      if (idClassePedagogique === WORKFLOW_FIXTURES.classeB) {
        return WORKFLOW_FIXTURES.sectionPrimaire;
      }

      return null;
    },
  });

  const resultatQuery = {
    async executer(idEleve: string, idAnneeScolaire: string) {
      assert.equal(idEleve, 'eleve-1');
      assert.equal(idAnneeScolaire, WORKFLOW_FIXTURES.anneeScolaireId);
      return {
        idResultatBulletinEleve: 'resultat-1',
        idEleve,
        idInscriptionScolaire: 'inscription-1',
        idEcole: TENANT_FIXTURES.ecoleA1,
        idClassePedagogique: WORKFLOW_FIXTURES.classeA,
        resultatsColonnes: [],
        applications: [],
        diagnostics: [],
      };
    },
  };

  const consulterResultatUseCase = new ConsulterResultatEleveUseCase(
    resultatQuery,
    adaptateur,
  );
  const consulterDiagnosticsUseCase = new ConsulterDiagnosticsResultatUseCase(
    {
      async executer() {
        return [];
      },
    },
    resultatQuery,
    adaptateur,
  );
  const consulterDiagnosticsHorsSectionUseCase = new ConsulterDiagnosticsResultatUseCase(
    {
      async executer() {
        return [];
      },
    },
    {
      async executer() {
        return {
          idResultatBulletinEleve: 'resultat-2',
          idEleve: 'eleve-2',
          idInscriptionScolaire: 'inscription-2',
          idEcole: TENANT_FIXTURES.ecoleA1,
          idClassePedagogique: WORKFLOW_FIXTURES.classeB,
          resultatsColonnes: [],
          applications: [],
          diagnostics: [],
        };
      },
    },
    adaptateur,
  );
  const consulterNonClassesUseCase = new ConsulterNonClassesUseCase(
    {
      async executer() {
        return [];
      },
    },
    adaptateur,
  );

  await consulterResultatUseCase.executer({
    idEleve: 'eleve-1',
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
  });

  await consulterDiagnosticsUseCase.executer({
    idEleve: 'eleve-1',
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
  });

  await consulterNonClassesUseCase.executer({
    idClassePedagogique: WORKFLOW_FIXTURES.classeA,
    idEcole: TENANT_FIXTURES.ecoleA1,
    idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: titulaire.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
  });

  await assert.rejects(
    () => consulterResultatUseCase.executer({
      idEleve: 'eleve-1',
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
      idUtilisateur: enseignant.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => consulterDiagnosticsHorsSectionUseCase.executer({
      idEleve: 'eleve-2',
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
      idUtilisateur: prefet.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => consulterNonClassesUseCase.executer({
      idClassePedagogique: WORKFLOW_FIXTURES.classeB,
      idEcole: TENANT_FIXTURES.ecoleA1,
      idAnneeScolaire: WORKFLOW_FIXTURES.anneeScolaireId,
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idUtilisateur: titulaire.utilisateurId,
      idOrganisation: TENANT_FIXTURES.organisationA,
    }),
    /pas autorise/i,
  );

  await adaptateur.fermer();
});
