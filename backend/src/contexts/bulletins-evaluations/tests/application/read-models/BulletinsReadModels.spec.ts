import test from 'node:test';
import assert from 'node:assert/strict';
import { BulletinProjectionHandler } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/projections/BulletinProjectionHandler';
import { ProjectionBulletinService } from 'contexts/bulletins-evaluations/infrastructure/services/ProjectionBulletinService';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';

// Ce fichier verifie la coherence minimale des read models projetes.
test('la projection de lecture conserve la forme attendue du bulletin', () => {
  const readModel: BulletinEleveReadModel = {
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

  const projection = new BulletinProjectionHandler(new ProjectionBulletinService()).projeter(readModel);
  assert.equal(projection.idBulletinEleve, 'bulletin-1');
  assert.equal(projection.templateDocumentaireSuggere, 'BULL-TPL-02');
  assert.deepEqual(projection.blocsApplicationConduite, []);
});

test('la projection de lecture conserve la mention de repechage d une ligne si elle existe', () => {
  const readModel: BulletinEleveReadModel = {
    idBulletinEleve: 'bulletin-2',
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
    lignes: [{
      idReferentielCours: 'cours-1',
      libelleCours: 'Mathematiques',
      ordreAffichage: 1,
      estCalculable: true,
      aExamen: true,
      mentionRepechage: '12/20',
      cotesColonnes: {},
      totauxColonnes: {},
      maximaColonnes: {},
      stylesColonnes: {},
    }],
    blocsApplicationConduite: [],
  };

  const projection = new BulletinProjectionHandler(new ProjectionBulletinService()).projeter(readModel);
  assert.equal(projection.lignes[0]?.mentionRepechage, '12/20');
});
