import test from 'node:test';
import assert from 'node:assert/strict';
import { BulletinProjectionHandler } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/projections/BulletinProjectionHandler';
import { ProjectionBulletinService } from 'contexts/bulletins-evaluations/infrastructure/services/ProjectionBulletinService';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import { reinitialiserMemoireBulletins } from '../../shared/BulletinsEvaluationsTestUtils';

// Ce fichier couvre la materialisation locale des projections documentaires.
test('les projections ecrivent et restituent des read models coherents', () => {
  reinitialiserMemoireBulletins();
  const readModel: BulletinEleveReadModel = {
    idBulletinEleve: 'bulletin-p1',
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

  const projection = new BulletinProjectionHandler(new ProjectionBulletinService()).projeter(readModel);
  assert.equal(projection.idBulletinEleve, 'bulletin-p1');
  assert.equal(projection.idEcole, 'ecole-1');
});
