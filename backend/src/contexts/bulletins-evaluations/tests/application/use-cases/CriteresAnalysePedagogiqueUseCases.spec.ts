import test from 'node:test';
import assert from 'node:assert/strict';
import { RecalculerResultatEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/RecalculerResultatEleve/RecalculerResultatEleveUseCase';
import { CriteresAnalysePedagogique } from 'contexts/bulletins-evaluations/domain/entities/CriteresAnalysePedagogique';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { creerFicheCotation, creerResultatBulletin } from '../../factories/BulletinsEvaluationsFactories';
import {
  CriteresAnalysePedagogiquePortMemoire,
  EventBusMemoire,
  TransactionManagerMemoire,
} from '../../mocks/BulletinsEvaluationsMocks';

test('le recalcul du resultat consolide applique des criteres pedagogiques parametres aux diagnostics', async () => {
  const resultat = creerResultatBulletin();
  const fiche = creerFicheCotation();
  fiche.encoderCote(CodeColonneBulletin.P1, 4, 'user-1');

  const depotResultat = {
    async sauvegarder() {},
    async trouverParId() { return null; },
    async trouverParEleveEtAnnee() { return null; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return []; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat() {},
    async listerSnapshotsResultats() { return []; },
  };

  const depotFiche = {
    async trouverParId() { return null; },
    async trouverParEleveCours() { return null; },
    async listerParEleve() { return [fiche]; },
    async listerParClasse() { return [fiche]; },
    async sauvegarder() {},
  };

  const useCase = new RecalculerResultatEleveUseCase(
    depotResultat,
    depotFiche as never,
    new TransactionManagerMemoire(),
    undefined,
    undefined,
    undefined,
    new EventBusMemoire(),
    new CriteresAnalysePedagogiquePortMemoire(new CriteresAnalysePedagogique({
      idCriteresAnalysePedagogique: 'criteres-1',
      seuilReussite: 60,
      seuilEchec: 30,
      seuilEchecLeger: 20,
      seuilEchecProfond: 10,
      seuilPerequation: 1,
      seuilRepechage: 1,
    })),
  );

  const sortie = await useCase.executer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.equal(sortie.diagnostics.length >= 1, true);
  assert.equal(sortie.diagnostics[0]?.nombreEchecs, 0);
});
