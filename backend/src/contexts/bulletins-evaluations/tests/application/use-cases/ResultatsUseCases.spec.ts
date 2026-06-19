import test from 'node:test';
import assert from 'node:assert/strict';
import { ConsulterComparatifClassesUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterComparatifClasses/ConsulterComparatifClassesUseCase';
import { ConsulterCoursProblematiqueUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterCoursProblematiques/ConsulterCoursProblematiqueUseCase';
import { ConsulterEchecsClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterEchecsClasse/ConsulterEchecsClasseUseCase';
import { ConsulterEchecsProfondsClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterEchecsProfondsClasse/ConsulterEchecsProfondsClasseUseCase';
import { ConsulterEvolutionResultatUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterEvolutionResultat/ConsulterEvolutionResultatUseCase';
import { ConsulterPerequationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterPerequationClasse/ConsulterPerequationClasseUseCase';
import { ConsulterRepechageClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterRepechageClasse/ConsulterRepechageClasseUseCase';
import { ConsulterDeliberationClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterDeliberationClasse/ConsulterDeliberationClasseUseCase';
import { ConsulterSecondeSessionClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterSecondeSessionClasse/ConsulterSecondeSessionClasseUseCase';
import { ConsulterDiagnosticsResultatUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterDiagnosticsResultat/ConsulterDiagnosticsResultatUseCase';
import { ConsulterResultatEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterResultatEleve/ConsulterResultatEleveUseCase';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { CriteresAnalysePedagogique } from 'contexts/bulletins-evaluations/domain/entities/CriteresAnalysePedagogique';
import { AutorisationConsultationStatistiquesPortMemoire, CriteresAnalysePedagogiquePortMemoire } from '../../mocks/BulletinsEvaluationsMocks';

test("le use case de consultation du resultat consolide relit la bonne query", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();
  const useCase = new ConsulterResultatEleveUseCase({
    async executer(idEleve, _idAnneeScolaire) {
      return {
        idResultatBulletinEleve: 'resultat-1',
        idEleve,
        idInscriptionScolaire: 'inscription-1',
        idEcole: 'ecole-1',
        idClassePedagogique: 'classe-1',
        resultatsColonnes: [{
          codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
          totalObtenu: 120,
          maximumGeneral: 200,
          pourcentage: 60,
          rang: 3,
          estClassable: true,
          estNonClasse: false,
        }],
        applications: [],
        diagnostics: [],
      };
    },
  }, autorisation);

  const sortie = await useCase.executer({
    idEleve: 'eleve-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  assert.equal(sortie.idEleve, 'eleve-1');
  assert.equal(sortie.resultatsColonnes[0]?.pourcentage, 60);
  assert.deepEqual(autorisation.dernierContexteClasse, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});

test("le use case de consultation du resultat consolide echoue proprement si le resultat est absent", async () => {
  const useCase = new ConsulterResultatEleveUseCase({
    async executer() {
      return null;
    },
  });

  await assert.rejects(
    () => useCase.executer({
      idEleve: 'eleve-inconnu',
      idAnneeScolaire: 'annee-1',
      idUtilisateur: 'user-1',
    }),
    /introuvable/i,
  );
});

test("la consultation des diagnostics reutilise la securite locale du resultat", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();
  const useCase = new ConsulterDiagnosticsResultatUseCase(
    {
      async executer(idEleve, idAnneeScolaire) {
        assert.equal(idEleve, 'eleve-1');
        assert.equal(idAnneeScolaire, 'annee-1');
        return [{
          idEleve,
          codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
          nombreEchecs: 2,
          nombreEchecsLegers: 1,
          nombreEchecsProfonds: 1,
          eligiblePerequation: false,
          eligibleRepechage: true,
          commentaireTechnique: 'Diagnostic',
        }];
      },
    },
    {
      async executer() {
        return {
          idResultatBulletinEleve: 'resultat-1',
          idEleve: 'eleve-1',
          idInscriptionScolaire: 'inscription-1',
          idEcole: 'ecole-1',
          idClassePedagogique: 'classe-1',
          resultatsColonnes: [],
          applications: [],
          diagnostics: [],
        };
      },
    },
    autorisation,
  );

  const sortie = await useCase.executer({
    idEleve: 'eleve-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  assert.equal(sortie.length, 1);
  assert.deepEqual(autorisation.dernierContexteClasse, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});

test("les analyses de base reutilisent la securite locale et les queries attendues", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();

  const consulterEchecsClasseUseCase = new ConsulterEchecsClasseUseCase(
    {
      async executer(idClassePedagogique, _idAnneeScolaire, codeColonne) {
        return [{
          idEleve: 'eleve-1',
          nomComplet: 'Eleve 1',
          sexe: undefined,
          idClassePedagogique,
          codeColonne,
          pourcentage: 45,
          rang: 8,
          nombreEchecs: 2,
          nombreEchecsProfonds: 1,
          eligiblePerequation: true,
          eligibleRepechage: true,
        }];
      },
    },
    autorisation,
  );

  const consulterEchecsProfondsClasseUseCase = new ConsulterEchecsProfondsClasseUseCase(
    {
      async executer(_idClassePedagogique, _idAnneeScolaire, _codeColonne, options) {
        assert.equal(options?.profondsSeulement, true);
        return [{
          idEleve: 'eleve-1',
          nomComplet: 'Eleve 1',
          sexe: undefined,
          idClassePedagogique: 'classe-1',
          codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
          pourcentage: 20,
          rang: undefined,
          nombreEchecs: 3,
          nombreEchecsProfonds: 2,
          eligiblePerequation: false,
          eligibleRepechage: false,
        }];
      },
    },
    autorisation,
  );

  const consulterCoursProblematiqueUseCase = new ConsulterCoursProblematiqueUseCase(
    {
      async executer(_idClassePedagogique, _idAnneeScolaire, codeColonne, seuilEchec, seuilEchecProfond) {
        assert.equal(seuilEchec, 60);
        assert.equal(seuilEchecProfond, 30);
        return [{
          idReferentielCours: 'cours-1',
          codeColonne,
          effectifEchecs: 5,
          effectifEchecsProfonds: 2,
          moyennePourcentage: 34.5,
          idsElevesConcernes: ['eleve-1'],
        }];
      },
    },
    new CriteresAnalysePedagogiquePortMemoire(new CriteresAnalysePedagogique({
      idCriteresAnalysePedagogique: 'criteres-1',
      seuilReussite: 60,
      seuilEchec: 60,
      seuilEchecLeger: 30,
      seuilEchecProfond: 30,
      seuilPerequation: 2,
      seuilRepechage: 2,
    })),
    autorisation,
  );

  const consulterEvolutionResultatUseCase = new ConsulterEvolutionResultatUseCase(
    {
      async executer(idEleve, idAnneeScolaire, codeColonne) {
        assert.equal(idEleve, 'eleve-1');
        assert.equal(idAnneeScolaire, 'annee-1');
        assert.equal(codeColonne, CodeColonneBulletin.TOTAL_GENERAL);
        return [{
          codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
          totalObtenu: 120,
          maximumGeneral: 200,
          pourcentage: 60,
          rang: 4,
          estNonClasse: false,
          dateObservation: new Date('2026-01-01T00:00:00.000Z'),
          motifObservation: 'ETAT_COURANT',
          estEtatCourant: true,
        }];
      },
    },
    {
      async executer() {
        return {
          idResultatBulletinEleve: 'resultat-1',
          idEleve: 'eleve-1',
          idInscriptionScolaire: 'inscription-1',
          idEcole: 'ecole-1',
          idClassePedagogique: 'classe-1',
          resultatsColonnes: [],
          applications: [],
          diagnostics: [],
        };
      },
    },
    autorisation,
  );

  const consulterComparatifClassesUseCase = new ConsulterComparatifClassesUseCase(
    {
      async executer(idClassesPedagogiques) {
        assert.deepEqual(idClassesPedagogiques, ['classe-1', 'classe-2']);
        return [{
          idClassePedagogique: 'classe-1',
          libelleClasse: '1A',
          codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
          participantsTotal: 20,
          classesTotal: 18,
          nonClassesTotal: 1,
          abandonsTotal: 1,
          tauxReussite: 90,
          tauxEchec: 10,
        }];
      },
    },
    autorisation,
  );

  const echecs = await consulterEchecsClasseUseCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'user-1',
  });
  const echecsProfonds = await consulterEchecsProfondsClasseUseCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'user-1',
  });
  const cours = await consulterCoursProblematiqueUseCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'user-1',
  });
  const evolution = await consulterEvolutionResultatUseCase.executer({
    idEleve: 'eleve-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'user-1',
  });
  const comparatif = await consulterComparatifClassesUseCase.executer({
    idClassesPedagogiques: ['classe-1', 'classe-2'],
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'user-1',
  });

  assert.equal(echecs.length, 1);
  assert.equal(echecsProfonds.length, 1);
  assert.equal(cours.length, 1);
  assert.equal(evolution.length, 1);
  assert.equal(comparatif.length, 1);
  assert.deepEqual(autorisation.dernierContexteClasse, {
    idUtilisateur: 'user-1',
    idOrganisation: undefined,
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-2',
    idAnneeScolaire: 'annee-1',
  });
});

test("la perequation reste reservee au secondaire et relit les eligibilites attendues", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();
  const useCase = new ConsulterPerequationClasseUseCase(
    {
      async executer(idClassePedagogique, idAnneeScolaire, codeColonne) {
        assert.equal(idClassePedagogique, 'classe-1');
        assert.equal(idAnneeScolaire, 'annee-1');
        assert.equal(codeColonne, CodeColonneBulletin.TOTAL_GENERAL);
        return [{
          idEleve: 'eleve-1',
          nomComplet: 'Eleve 1',
          sexe: undefined,
          idClassePedagogique,
          codeColonne,
          pourcentage: 48,
          rang: 6,
          nombreEchecs: 2,
          nombreEchecsLegers: 2,
          nombreEchecsProfonds: 0,
          eligiblePerequation: true,
        }];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-secondaire',
          sectionCode: 'SECONDAIRE',
          sectionLibelle: 'Secondaire',
        };
      },
    },
    autorisation,
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'prefet-1',
  });

  assert.equal(sortie.length, 1);

  const useCasePrimaire = new ConsulterPerequationClasseUseCase(
    {
      async executer() {
        return [];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-primaire',
          sectionCode: 'PRIMAIRE',
          sectionLibelle: 'Primaire',
        };
      },
    },
    autorisation,
  );

  await assert.rejects(
    () => useCasePrimaire.executer({
      idClassePedagogique: 'classe-p',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idUtilisateur: 'prefet-1',
    }),
    /secondaire/i,
  );
});

test("le repechage reste reserve au secondaire et relit les eligibilites attendues", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();
  const useCase = new ConsulterRepechageClasseUseCase(
    {
      async executer(idClassePedagogique, idAnneeScolaire, codeColonne) {
        assert.equal(idClassePedagogique, 'classe-1');
        assert.equal(idAnneeScolaire, 'annee-1');
        assert.equal(codeColonne, CodeColonneBulletin.TOTAL_GENERAL);
        return [{
          idEleve: 'eleve-1',
          nomComplet: 'Eleve 1',
          sexe: undefined,
          idClassePedagogique,
          codeColonne,
          pourcentage: 49,
          rang: 5,
          nombreEchecs: 2,
          nombreEchecsLegers: 1,
          nombreEchecsProfonds: 1,
          eligibleRepechage: true,
        }];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-secondaire',
          sectionCode: 'SECONDAIRE',
          sectionLibelle: 'Secondaire',
        };
      },
    },
    autorisation,
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'prefet-1',
  });

  assert.equal(sortie.length, 1);

  const useCasePrimaire = new ConsulterRepechageClasseUseCase(
    {
      async executer() {
        return [];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-primaire',
          sectionCode: 'PRIMAIRE',
          sectionLibelle: 'Primaire',
        };
      },
    },
    autorisation,
  );

  await assert.rejects(
    () => useCasePrimaire.executer({
      idClassePedagogique: 'classe-p',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idUtilisateur: 'prefet-1',
    }),
    /secondaire/i,
  );
});

test("la deliberation reste reservee au secondaire et relit les dossiers attendus", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();
  const useCase = new ConsulterDeliberationClasseUseCase(
    {
      async executer(idClassePedagogique, idAnneeScolaire, codeColonne) {
        assert.equal(idClassePedagogique, 'classe-1');
        assert.equal(idAnneeScolaire, 'annee-1');
        assert.equal(codeColonne, CodeColonneBulletin.TOTAL_GENERAL);
        return [{
          idEleve: 'eleve-1',
          nomComplet: 'Eleve 1',
          sexe: undefined,
          idClassePedagogique,
          codeColonne,
          pourcentage: 42,
          rang: 7,
          nombreEchecs: 3,
          nombreEchecsLegers: 2,
          nombreEchecsProfonds: 1,
          eligiblePerequation: true,
          eligibleRepechage: false,
          commentaireTechnique: 'Diagnostic derive automatiquement des cotes en echec.',
        }];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-secondaire',
          sectionCode: 'SECONDAIRE',
          sectionLibelle: 'Secondaire',
        };
      },
    },
    autorisation,
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'prefet-1',
  });

  assert.equal(sortie.length, 1);

  const useCasePrimaire = new ConsulterDeliberationClasseUseCase(
    {
      async executer() {
        return [];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-primaire',
          sectionCode: 'PRIMAIRE',
          sectionLibelle: 'Primaire',
        };
      },
    },
    autorisation,
  );

  await assert.rejects(
    () => useCasePrimaire.executer({
      idClassePedagogique: 'classe-p',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idUtilisateur: 'prefet-1',
    }),
    /secondaire/i,
  );
});

test("la seconde session reste reservee au secondaire et relit les dossiers attendus", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();
  const useCase = new ConsulterSecondeSessionClasseUseCase(
    {
      async executer(idClassePedagogique, idAnneeScolaire, codeColonne) {
        assert.equal(idClassePedagogique, 'classe-1');
        assert.equal(idAnneeScolaire, 'annee-1');
        assert.equal(codeColonne, CodeColonneBulletin.TOTAL_GENERAL);
        return [{
          idEleve: 'eleve-1',
          nomComplet: 'Eleve 1',
          sexe: undefined,
          idClassePedagogique,
          codeColonne,
          pourcentage: 49,
          rang: 5,
          nombreEchecs: 2,
          nombreEchecsLegers: 1,
          nombreEchecsProfonds: 1,
          eligiblePerequation: false,
          eligibleRepechage: true,
          commentaireTechnique: 'Diagnostic derive automatiquement des cotes en echec.',
        }];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-secondaire',
          sectionCode: 'SECONDAIRE',
          sectionLibelle: 'Secondaire',
        };
      },
    },
    autorisation,
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'prefet-1',
  });

  assert.equal(sortie.length, 1);

  const useCasePrimaire = new ConsulterSecondeSessionClasseUseCase(
    {
      async executer() {
        return [];
      },
    },
    {
      async consulterSectionClasse() {
        return {
          idSectionScolaire: 'section-primaire',
          sectionCode: 'PRIMAIRE',
          sectionLibelle: 'Primaire',
        };
      },
    },
    autorisation,
  );

  await assert.rejects(
    () => useCasePrimaire.executer({
      idClassePedagogique: 'classe-p',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idUtilisateur: 'prefet-1',
    }),
    /secondaire/i,
  );
});
