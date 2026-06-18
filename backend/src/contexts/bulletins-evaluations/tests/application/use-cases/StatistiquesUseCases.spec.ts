import test from 'node:test';
import assert from 'node:assert/strict';
import { ConsulterAbandonsUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterAbandons/ConsulterAbandonsUseCase';
import { ConsulterNonClassesUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterNonClasses/ConsulterNonClassesUseCase';
import { ConsulterStatistiquesClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterStatistiquesClasse/ConsulterStatistiquesClasseUseCase';
import { ConsulterStatistiquesEcoleUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterStatistiquesEcole/ConsulterStatistiquesEcoleUseCase';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';
import { AutorisationConsultationStatistiquesPortMemoire } from '../../mocks/BulletinsEvaluationsMocks';

test("les use cases statistiques appliquent l'autorisation locale et relaient les lectures attendues", async () => {
  const autorisation = new AutorisationConsultationStatistiquesPortMemoire();
  const statistiquesClasse = new ConsulterStatistiquesClasseUseCase(
    {
      async executer(idClassePedagogique, idAnneeScolaire, codeColonne) {
        return {
          idClassePedagogique,
          idAnneeScolaire,
          codeColonne,
          inscritsTotal: 10,
          participantsTotal: 9,
          classesTotal: 8,
          nonClassesTotal: 1,
          abandonsTotal: 1,
          reussitesTotal: 7,
          echecsTotal: 1,
          inscritsGarcons: 5,
          inscritsFilles: 5,
          participantsGarcons: 4,
          participantsFilles: 5,
          classesGarcons: 4,
          classesFilles: 4,
          nonClassesGarcons: 1,
          nonClassesFilles: 0,
          abandonsGarcons: 0,
          abandonsFilles: 1,
          reussitesGarcons: 4,
          reussitesFilles: 3,
          echecsGarcons: 0,
          echecsFilles: 1,
          tauxParticipation: 90,
          tauxReussite: 87.5,
          tauxEchec: 12.5,
          tauxAbandon: 10,
        };
      },
    },
    autorisation,
  );

  const sortieClasse = await statistiquesClasse.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  assert.equal(sortieClasse.inscritsTotal, 10);
  assert.deepEqual(autorisation.dernierContexteClasse, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  const statistiquesEcole = new ConsulterStatistiquesEcoleUseCase(
    {
      async executer(idEcole) {
        return {
          idEcole,
          inscritsTotal: 20,
          participantsTotal: 18,
          classesTotal: 15,
          nonClassesTotal: 2,
          abandonsTotal: 1,
          reussitesTotal: 13,
          echecsTotal: 2,
          inscritsGarcons: 10,
          inscritsFilles: 10,
          participantsGarcons: 9,
          participantsFilles: 9,
          classesGarcons: 8,
          classesFilles: 7,
          nonClassesGarcons: 1,
          nonClassesFilles: 1,
          abandonsGarcons: 0,
          abandonsFilles: 1,
          reussitesGarcons: 7,
          reussitesFilles: 6,
          echecsGarcons: 1,
          echecsFilles: 1,
          tauxParticipation: 90,
          tauxReussite: 86.6,
          tauxEchec: 13.4,
          tauxAbandon: 5,
        };
      },
    },
    autorisation,
  );

  await statistiquesEcole.executer({
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'prefet-1',
    idOrganisation: 'org-1',
  });

  assert.deepEqual(autorisation.dernierContexteEcole, {
    idUtilisateur: 'prefet-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
  });

  const nonClassesUseCase = new ConsulterNonClassesUseCase(
    {
      async executer() {
        return [{ idEleve: 'eleve-1', nomComplet: 'Eleve 1', sexe: SexeEleve.M, motifs: [], coursManquants: [], colonnesManquantes: [] }];
      },
    },
    autorisation,
  );
  const abandonsUseCase = new ConsulterAbandonsUseCase(
    {
      async executer() {
        return [{ idEleve: 'eleve-2', nomComplet: 'Eleve 2', sexe: SexeEleve.F, dateAbandon: undefined, motifAbandon: undefined }];
      },
    },
    autorisation,
  );

  const nonClasses = await nonClassesUseCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idUtilisateur: 'user-1',
  });
  const abandons = await abandonsUseCase.executer({
    idClassePedagogique: 'classe-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
  });

  assert.equal(nonClasses.length, 1);
  assert.equal(abandons.length, 1);
});

test("les use cases statistiques refusent un acteur non autorise localement", async () => {
  const useCaseClasse = new ConsulterStatistiquesClasseUseCase(
    {
      async executer() {
        return null;
      },
    },
    new AutorisationConsultationStatistiquesPortMemoire(new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => useCaseClasse.executer({
      idClassePedagogique: 'classe-1',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idUtilisateur: 'parent-1',
    }),
    /PERMISSION_REFUSED/i,
  );

  const useCaseEcole = new ConsulterStatistiquesEcoleUseCase(
    {
      async executer() {
        return null;
      },
    },
    new AutorisationConsultationStatistiquesPortMemoire(undefined, new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => useCaseEcole.executer({
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idUtilisateur: 'parent-1',
    }),
    /PERMISSION_REFUSED/i,
  );
});
