import test from 'node:test';
import assert from 'node:assert/strict';
import { ApplicationException } from 'contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import { BulletinPresenter } from 'contexts/bulletins-evaluations/interfaces/http/presenters/BulletinPresenter';
import { ErrorPresenter } from 'contexts/bulletins-evaluations/interfaces/http/presenters/ErrorPresenter';

// Ce fichier couvre les presenters de reponses HTTP du BC.
test('les presenters stabilisent les reponses normales et les erreurs', () => {
  const presenter = BulletinPresenter.presenter({
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
    lignes: [{
      idReferentielCours: 'cours-1',
      libelleCours: 'Mathematiques',
      ordreAffichage: 1,
      estCalculable: true,
      aExamen: true,
      mentionRepechage: '14/20',
      cotesColonnes: {},
      totauxColonnes: {},
      maximaColonnes: {},
      stylesColonnes: {},
    }],
    blocsApplicationConduite: [],
  });
  assert.equal(presenter.donnee.idBulletinEleve, 'bulletin-1');
  assert.equal(presenter.donnee.lignes[0]?.mentionRepechage, '14/20');

  const erreur = ErrorPresenter.presenterErreur(new ApplicationException('Erreur metier', 'BULLETIN_ERREUR'));
  assert.equal(erreur.statutHttp, 400);
  assert.equal(erreur.corps.code, 'BULLETIN_ERREUR');
});
