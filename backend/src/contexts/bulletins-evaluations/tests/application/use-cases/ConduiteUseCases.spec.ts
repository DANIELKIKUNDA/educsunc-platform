import test from 'node:test';
import assert from 'node:assert/strict';
import { EncoderConduiteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderConduite/EncoderConduiteUseCase';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import { AutorisationConduitePortMemoire, EventBusMemoire, TransactionManagerMemoire } from '../../mocks/BulletinsEvaluationsMocks';
import { creerResultatBulletin } from '../../factories/BulletinsEvaluationsFactories';

test("l'encodage de conduite relit le resultat par id puis verifie localement le perimetre", async () => {
  const resultat = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  const autorisation = new AutorisationConduitePortMemoire();
  const eventBus = new EventBusMemoire();
  const historiques: Array<{ anciensPointsConduite: number | null; nouveauxPointsConduite: number; encodeePar: string }> = [];
  let idRelu: string | null = null;
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId(idResultatBulletinEleve) {
      idRelu = idResultatBulletinEleve;
      return resultat;
    },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite(historiqueEncodageConduite) {
      historiques.push({
        anciensPointsConduite: historiqueEncodageConduite.obtenirAnciensPointsConduite(),
        nouveauxPointsConduite: historiqueEncodageConduite.obtenirNouveauxPointsConduite(),
        encodeePar: historiqueEncodageConduite.obtenirEncodeePar(),
      });
    },
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat() {},
    async listerSnapshotsResultats() { return []; },
  };

  const useCase = new EncoderConduiteUseCase(
    depotResultat,
    new TransactionManagerMemoire(),
    autorisation,
    undefined,
    undefined,
    eventBus,
  );

  const sortie = await useCase.executer({
    idResultatBulletinEleve: 'resultat-1',
    codePeriode: CodePeriodeSimple.P1,
    pointsConduite: 84,
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  assert.equal(idRelu, 'resultat-1');
  assert.equal(sortie.idResultatBulletinEleve, 'resultat-1');
  assert.deepEqual(autorisation.dernierContexte, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  assert.deepEqual(historiques, [
    {
      anciensPointsConduite: null,
      nouveauxPointsConduite: 84,
      encodeePar: 'user-1',
    },
  ]);
  assert.ok(eventBus.evenementsPublies.length > 0);
});

test("l'encodage de conduite refuse un utilisateur non autorise localement", async () => {
  const resultat = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-1',
  });
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat() {},
    async listerSnapshotsResultats() { return []; },
  };
  const useCase = new EncoderConduiteUseCase(
    depotResultat,
    new TransactionManagerMemoire(),
    new AutorisationConduitePortMemoire(new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => useCase.executer({
      idResultatBulletinEleve: 'resultat-1',
      codePeriode: CodePeriodeSimple.P1,
      pointsConduite: 70,
      idUtilisateur: 'user-1',
    }),
    /PERMISSION_REFUSED/i,
  );
});

test("une conduite deja encodee peut etre modifiee et republie le nouvel etat", async () => {
  const resultat = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-1',
  });
  const historiques: Array<{ anciensPointsConduite: number | null; nouveauxPointsConduite: number; encodeePar: string }> = [];
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultat; },
    async trouverParEleveEtAnnee() { return resultat; },
    async trouverParEleveInscription() { return resultat; },
    async listerParClasse() { return [resultat]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite(historiqueEncodageConduite) {
      historiques.push({
        anciensPointsConduite: historiqueEncodageConduite.obtenirAnciensPointsConduite(),
        nouveauxPointsConduite: historiqueEncodageConduite.obtenirNouveauxPointsConduite(),
        encodeePar: historiqueEncodageConduite.obtenirEncodeePar(),
      });
    },
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat() {},
    async listerSnapshotsResultats() { return []; },
  };
  const autorisation = new AutorisationConduitePortMemoire();
  const eventBus = new EventBusMemoire();
  const useCase = new EncoderConduiteUseCase(
    depotResultat,
    new TransactionManagerMemoire(),
    autorisation,
    undefined,
    undefined,
    eventBus,
  );

  await useCase.executer({
    idResultatBulletinEleve: 'resultat-1',
    codePeriode: CodePeriodeSimple.P1,
    pointsConduite: 65,
    idUtilisateur: 'user-1',
  });

  const sortie = await useCase.executer({
    idResultatBulletinEleve: 'resultat-1',
    codePeriode: CodePeriodeSimple.P1,
    pointsConduite: 80,
    idUtilisateur: 'user-2',
  });

  const blocConduite = sortie.applications.find((application) => application.codePeriode === CodePeriodeSimple.P1 && application.pointsConduite !== undefined);
  assert.equal(blocConduite?.pointsConduite, 80);
  assert.equal(resultat.obtenirConduitesPeriodes()[0]?.obtenirPointsConduite(), 80);
  assert.equal(resultat.obtenirConduitesPeriodes()[0]?.obtenirEncodeePar(), 'user-2');
  assert.ok(resultat.obtenirConduitesPeriodes()[0]?.obtenirDateEncodage() instanceof Date);
  assert.deepEqual(historiques, [
    { anciensPointsConduite: null, nouveauxPointsConduite: 65, encodeePar: 'user-1' },
    { anciensPointsConduite: 65, nouveauxPointsConduite: 80, encodeePar: 'user-2' },
  ]);
  assert.ok(eventBus.evenementsPublies.length >= 2);
});
