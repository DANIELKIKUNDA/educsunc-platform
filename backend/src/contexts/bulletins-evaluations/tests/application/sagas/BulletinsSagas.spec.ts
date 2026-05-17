import test from 'node:test';
import assert from 'node:assert/strict';
import type { GenererBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase';
import type { RecalculerClassementClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/RecalculerClassementClasse/RecalculerClassementClasseUseCase';
import type { RecalculerResultatEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/RecalculerResultatEleve/RecalculerResultatEleveUseCase';
import { SagaGenerationBulletin } from 'contexts/bulletins-evaluations/application/sagas/SagaGenerationBulletin';
import type { BulletinEleveOutput } from 'contexts/bulletins-evaluations/application/dto/output/BulletinEleveOutput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';

// Ce fichier couvre l'orchestration longue des sagas principales.
test('la saga de generation enchaine recalcul, classement puis generation', async () => {
  const ordre: string[] = [];
  const sortieBulletin: BulletinEleveOutput = {
    idBulletinEleve: 'bulletin-1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    etatBulletin: EtatBulletin.GENERE,
    versionBulletin: 1,
    lignes: [],
    blocsApplicationConduite: [],
  };

  const saga = new SagaGenerationBulletin(
    {
      async executer() {
        ordre.push('resultat');
        return {
          idResultatBulletinEleve: 'resultat-1',
          idEleve: 'eleve-1',
          idInscriptionScolaire: 'inscription-1',
          resultatsColonnes: [{
            codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
            estClassable: true,
            estNonClasse: false,
          }],
          applications: [],
          diagnostics: [],
        };
      },
    } as unknown as RecalculerResultatEleveUseCase,
    {
      async executer() {
        ordre.push('classement');
      },
    } as unknown as RecalculerClassementClasseUseCase,
    {
      async executer() {
        ordre.push('bulletin');
        return sortieBulletin;
      },
    } as unknown as GenererBulletinEleveUseCase,
  );

  const sortie = await saga.executer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    typeGeneration: 'PROGRESSIF',
  });
  assert.deepEqual(ordre, ['resultat', 'classement', 'bulletin']);
  assert.equal(sortie.idBulletinEleve, 'bulletin-1');
});
