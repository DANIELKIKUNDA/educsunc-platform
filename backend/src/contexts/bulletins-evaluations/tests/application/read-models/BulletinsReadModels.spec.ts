import test from 'node:test';
import assert from 'node:assert/strict';
import { BulletinProjectionHandler } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/projections/BulletinProjectionHandler';
import { ProjectionBulletinService } from 'contexts/bulletins-evaluations/infrastructure/services/ProjectionBulletinService';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';

// Ce fichier verifie la coherence minimale des read models projetes.
test('la projection de lecture conserve la forme attendue du bulletin', () => {
  const readModel: BulletinEleveReadModel = {
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

  const projection = new BulletinProjectionHandler(new ProjectionBulletinService()).projeter(readModel);
  assert.equal(projection.idBulletinEleve, 'bulletin-1');
  assert.deepEqual(projection.blocsApplicationConduite, []);
});
