import test from 'node:test';
import assert from 'node:assert/strict';
import { EncoderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase';
import { GenererBulletinEleveUseCase } from 'contexts/bulletins-evaluations/application/use-cases/GenererBulletinEleve/GenererBulletinEleveUseCase';
import { SynchroniserOperationsOfflineUseCase } from 'contexts/bulletins-evaluations/application/use-cases/SynchroniserOperationsOffline/SynchroniserOperationsOfflineUseCase';
import type { DepotBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotBulletinEleve';
import type { DepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/repositories/DepotFicheCotationEleveCours';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import { CacheMemoire, EventBusMemoire, PdfPortMemoire, ReferentielAcademiquePortMemoire, TransactionManagerMemoire } from '../../mocks/BulletinsEvaluationsMocks';
import { creerBulletin, creerFicheCotation, creerResultatBulletin } from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre les cas d'usage applicatifs principaux du BC.
test('les use cases orchestrent transaction, projection et workflow offline', async () => {
  const fiche = creerFicheCotation();
  const depotFiche: DepotFicheCotationEleveCours = {
    async sauvegarder() {},
    async trouverParId() { return fiche; },
    async trouverParEleveCoursEtAnnee() { return fiche; },
    async listerParEleve() { return [fiche]; },
    async listerParClasseEtCours() { return [fiche]; },
    async listerParClasseEtColonne() { return [fiche]; },
    async existeFichePourEleveCoursAnnee() { return true; },
  };

  const transaction = new TransactionManagerMemoire();
  const eventBus = new EventBusMemoire();
  const encoderUseCase = new EncoderCoteUseCase(depotFiche, transaction, undefined, undefined, undefined, undefined, undefined, eventBus);
  const sortieFiche = await encoderUseCase.executer({
    idFicheCotationEleveCours: fiche.obtenirId(),
    codeColonne: CodeColonneBulletin.P1,
    cote: 8,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
  });
  assert.equal(transaction.nombreTransactions, 1);
  assert.equal(sortieFiche.colonnes[0].codeColonne, CodeColonneBulletin.P1);
  assert.ok(eventBus.evenementsPublies.length > 0);

  const bulletin = creerBulletin();
  const resultat = creerResultatBulletin();
  resultat.mettreAJourApplication(CodePeriodeSimple.P1, 72);
  const depotBulletin: DepotBulletinEleve = {
    async sauvegarder() {},
    async trouverParEleveEtAnnee() { return bulletin; },
    async trouverVersionActive() { return bulletin; },
    async listerParClasse() { return [bulletin]; },
    async listerHistoriqueGenerations() { return bulletin.obtenirHistoriqueGeneration(); },
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
  };
  const generationUseCase = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    new ReferentielAcademiquePortMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    new CacheMemoire(),
    new EventBusMemoire(),
  );
  const sortieBulletin = await generationUseCase.executer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    typeGeneration: 'PROGRESSIF',
    preparerPdf: true,
  });
  assert.equal(sortieBulletin.idEleve, 'eleve-1');
  assert.equal(sortieBulletin.lignes.length, 1);

  const generationUseCaseAvecPdf = new GenererBulletinEleveUseCase(
    depotBulletin,
    depotResultat,
    new TransactionManagerMemoire(),
    new ReferentielAcademiquePortMemoire(),
    undefined,
    undefined,
    undefined,
    undefined,
    new PdfPortMemoire(),
    undefined,
    new EventBusMemoire(),
  );
  await generationUseCaseAvecPdf.executer({
    idEleve: 'eleve-1',
    idInscriptionScolaire: 'inscription-1',
    idAnneeScolaire: 'annee-1',
    idUtilisateur: 'user-1',
    typeGeneration: 'PROGRESSIF',
    preparerPdf: true,
  });

  const synchronisationUseCase = new SynchroniserOperationsOfflineUseCase({
    async enregistrer() {},
    async marquerSynchronisee(idOperationOffline: string) {
      return {
        idOperationOffline,
        statut: 'SYNCHRONISEE',
        message: 'OK',
      };
    },
  });
  const sortieSync = await synchronisationUseCase.executer({
    idOperationOffline: 'offline-1',
    typeOperation: 'ENCODER_COTE',
    payload: { cote: 8 },
    cleIdempotence: 'cle-sync-1',
  });
  assert.equal(sortieSync.statut, 'SYNCHRONISEE');
});
