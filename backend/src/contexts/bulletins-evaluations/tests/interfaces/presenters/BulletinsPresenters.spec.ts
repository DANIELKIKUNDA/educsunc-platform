import test from 'node:test';
import assert from 'node:assert/strict';
import { ApplicationException } from 'contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { EtatBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/EtatBulletin';
import { BulletinPresenter } from 'contexts/bulletins-evaluations/interfaces/http/presenters/BulletinPresenter';
import { ErrorPresenter } from 'contexts/bulletins-evaluations/interfaces/http/presenters/ErrorPresenter';

// Ce fichier couvre les presenters de reponses HTTP du BC.
test('les presenters stabilisent les reponses normales et les erreurs', () => {
  const presenter = BulletinPresenter.presenter({
    idBulletinEleve: 'bulletin-1',
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    etatBulletin: EtatBulletin.GENERE,
    versionBulletin: 1,
    lignes: [],
    blocsApplicationConduite: [],
  });
  assert.equal(presenter.donnee.idBulletinEleve, 'bulletin-1');

  const erreur = ErrorPresenter.presenterErreur(new ApplicationException('Erreur metier', 'BULLETIN_ERREUR'));
  assert.equal(erreur.statutHttp, 400);
  assert.equal(erreur.corps.code, 'BULLETIN_ERREUR');
});
