import test from 'node:test';
import assert from 'node:assert/strict';
import type { ConsulterBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterBulletinEleve/ConsulterBulletinEleveUseCase';
import type { ConsulterHistoriqueBulletinUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterHistoriqueBulletin/ConsulterHistoriqueBulletinUseCase';
import type { GenererBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase';
import { BulletinsController } from 'contexts/bulletins-evaluations/interfaces/http/controllers/BulletinsController';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import { PdfPortMemoire } from '../../mocks/BulletinsEvaluationsMocks';

// Ce fichier couvre les controllers HTTP principaux du BC.
test('le controller bulletins valide, appelle les cas d usage et presente les sorties', async () => {
  let consultationEntree: Record<string, unknown> | undefined;
  let historiqueEntree: Record<string, unknown> | undefined;
  const controller = new BulletinsController(
    {
      async executer() {
        return {
          idBulletinEleve: 'bulletin-1',
          idEcole: 'ecole-1',
          idEleve: 'eleve-1',
          idInscriptionScolaire: 'inscription-1',
          idClassePedagogique: 'classe-1',
          idAnneeScolaire: 'annee-1',
          idProgrammeNiveau: 'programme-1',
          versionReferentielProgramme: 'version-ref-1',
          typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
          templateDocumentaireSuggere: 'BULL-TPL-02',
          etatBulletin: EtatBulletin.GENERE,
          versionBulletin: 1,
          lignes: [],
          blocsApplicationConduite: [],
        };
      },
    } as unknown as GenererBulletinEleveUseCase,
    {
      async executer(entree: unknown) {
        consultationEntree = entree as Record<string, unknown>;
        return {
          idBulletinEleve: 'bulletin-1',
          idEcole: 'ecole-1',
          idEleve: 'eleve-1',
          idInscriptionScolaire: 'inscription-1',
          idClassePedagogique: 'classe-1',
          idAnneeScolaire: 'annee-1',
          idProgrammeNiveau: 'programme-1',
          versionReferentielProgramme: 'version-ref-1',
          typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
          templateDocumentaireSuggere: 'BULL-TPL-02',
          etatBulletin: EtatBulletin.GENERE,
          versionBulletin: 1,
          lignes: [],
          blocsApplicationConduite: [],
        };
      },
    } as unknown as ConsulterBulletinEleveUseCase,
    {
      async executer(entree: unknown) {
        historiqueEntree = entree as Record<string, unknown>;
        return [{ versionBulletin: 1 }];
      },
    } as unknown as ConsulterHistoriqueBulletinUseCase,
    new PdfPortMemoire(),
  );

  const generation = await controller.generer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    typeGeneration: 'PROGRESSIF',
  }, { 'x-user-id': 'user-1' });
  assert.equal((generation.donnee as { idEleve: string }).idEleve, 'eleve-1');

  const consultation = await controller.consulter(
    { idEleve: 'eleve-1', idAnneeScolaire: 'annee-1' },
    { 'x-user-id': 'user-1', 'x-tenant-id': 'ecole-1', 'x-organisation-id': 'org-1' },
  );
  assert.equal((consultation.donnee as { idBulletinEleve: string }).idBulletinEleve, 'bulletin-1');
  assert.deepEqual(consultationEntree, {
    idEleve: 'eleve-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idOrganisation: 'org-1',
  });

  const historique = await controller.consulterHistorique(
    { idBulletinEleve: 'bulletin-1' },
    { 'x-user-id': 'user-1', 'x-tenant-id': 'ecole-1', 'x-organisation-id': 'org-1' },
  );
  assert.equal((historique.donnee as Array<{ versionBulletin: number }>)[0].versionBulletin, 1);
  assert.deepEqual(historiqueEntree, {
    idBulletinEleve: 'bulletin-1',
    idUtilisateur: 'user-1',
    idEcole: 'ecole-1',
    idOrganisation: 'org-1',
  });
});
