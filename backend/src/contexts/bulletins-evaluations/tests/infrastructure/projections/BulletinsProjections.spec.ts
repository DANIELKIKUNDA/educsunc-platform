import test from 'node:test';
import assert from 'node:assert/strict';
import { BulletinProjectionHandler } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/projections/BulletinProjectionHandler';
import { ProjectionBulletinService } from 'contexts/bulletins-evaluations/infrastructure/services/ProjectionBulletinService';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { reinitialiserMemoireBulletins } from '../../shared/BulletinsEvaluationsTestUtils';

// Ce fichier couvre la materialisation locale des projections documentaires.
test('les projections ecrivent et restituent des read models coherents', () => {
  reinitialiserMemoireBulletins();
  const readModel: BulletinEleveReadModel = {
    idBulletinEleve: 'bulletin-p1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    etatBulletin: EtatBulletin.GENERE,
    versionBulletin: 1,
    lignes: [],
    blocsApplicationConduite: [],
  };

  const projection = new BulletinProjectionHandler(new ProjectionBulletinService()).projeter(readModel);
  assert.equal(projection.idBulletinEleve, 'bulletin-p1');
});
