import test from 'node:test';
import assert from 'node:assert/strict';
import { ConsulterClassementClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterClassementClasse/ConsulterClassementClasseUseCase';
import { RecalculerClassementClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/RecalculerClassementClasse/RecalculerClassementClasseUseCase';
import { SnapshotResultatBulletin } from 'contexts/bulletins-evaluations/domain/entities/SnapshotResultatBulletin';
import type { DepotClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotClassementColonneClasse';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { AutorisationClassementPortMemoire, TransactionManagerMemoire } from '../../mocks/BulletinsEvaluationsMocks';
import { creerClassement, creerResultatBulletin, creerResultatColonne } from '../../factories/BulletinsEvaluationsFactories';

test("la consultation d'un classement verifie localement le perimetre puis relit la projection", async () => {
  const autorisation = new AutorisationClassementPortMemoire();
  const useCase = new ConsulterClassementClasseUseCase(
    {
      async executer(idClassePedagogique, idAnneeScolaire, codeColonne) {
        return {
          idClassementColonneClasse: 'classement-1',
          idClassePedagogique,
          idAnneeScolaire,
          codeColonne: codeColonne as CodeColonneBulletin,
          lignes: [{
            idEleve: 'eleve-1',
            nomComplet: 'Eleve 1',
            sexe: 'M' as never,
            totalObtenu: 120,
            maximumGeneral: 200,
            pourcentage: 60,
            rang: 1,
            estNonClasse: false,
          }],
        };
      },
    },
    autorisation,
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  assert.equal(sortie.idClassementColonneClasse, 'classement-1');
  assert.equal(sortie.lignes[0]?.nomComplet, 'Eleve 1');
  assert.deepEqual(autorisation.dernierContexteConsultation, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});

test("le recalcul cree automatiquement le classement au premier passage et verifie localement bulletins.generate", async () => {
  let classementSauvegarde = creerClassement({
    idClassementColonneClasse: 'placeholder',
    lignesClassement: [],
  });
  let aSauvegarde = false;
  const depotClassement: DepotClassementColonneClasse = {
    async sauvegarder(classement) {
      classementSauvegarde = classement;
      aSauvegarde = true;
    },
    async trouverParClasseEtColonne() { return null; },
    async listerParClasse() { return []; },
    async supprimerLogiquementAncienClassement() {},
  };
  const resultatClasse = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    resultatsColonnes: [
      creerResultatColonne(CodeColonneBulletin.TOTAL_GENERAL, {
        totalObtenu: 120,
        maximumGeneral: 200,
        pourcentage: 60,
        rang: 2,
        estClassable: true,
        estNonClasse: false,
      }),
    ],
  });
  const resultatSecond = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-2',
    idEleve: 'eleve-2',
    idInscriptionScolaire: 'inscription-2',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    resultatsColonnes: [
      creerResultatColonne(CodeColonneBulletin.TOTAL_GENERAL, {
        totalObtenu: 160,
        maximumGeneral: 200,
        pourcentage: 80,
        rang: 1,
        estClassable: true,
        estNonClasse: false,
      }),
    ],
  });
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return resultatClasse; },
    async trouverParEleveEtAnnee() { return resultatClasse; },
    async trouverParEleveInscription() { return resultatClasse; },
    async listerParClasse() { return [resultatClasse, resultatSecond]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return []; },
  };
  const autorisation = new AutorisationClassementPortMemoire();
  const useCase = new RecalculerClassementClasseUseCase(
    depotClassement,
    depotResultat,
    new TransactionManagerMemoire(),
    autorisation,
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    idEcole: 'ecole-1',
    idUtilisateur: 'titulaire-1',
    idOrganisation: 'org-1',
  });

  assert.equal(aSauvegarde, true);
  assert.equal(sortie.idClassePedagogique, 'classe-1');
  assert.equal(classementSauvegarde.obtenirId(), 'classement-classe-1-annee-1-TOTAL_GENERAL');
  assert.equal(classementSauvegarde.obtenirLignesClassement()[0]?.obtenirIdEleve(), 'eleve-2');
  assert.equal(classementSauvegarde.obtenirLignesClassement()[0]?.obtenirNomComplet(), 'eleve-2');
  assert.deepEqual(autorisation.dernierContexteRecalcul, {
    idUtilisateur: 'titulaire-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});

test("la consultation et le recalcul d'un classement refusent un utilisateur non autorise localement", async () => {
  const useCaseConsultation = new ConsulterClassementClasseUseCase(
    {
      async executer() {
        return {
          idClassementColonneClasse: 'classement-1',
          idClassePedagogique: 'classe-1',
          idAnneeScolaire: 'annee-1',
          codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
          lignes: [{
            idEleve: 'eleve-1',
            nomComplet: 'Eleve 1',
            sexe: 'M' as never,
            totalObtenu: 120,
            maximumGeneral: 200,
            pourcentage: 60,
            rang: 1,
            estNonClasse: false,
          }],
        };
      },
    },
    new AutorisationClassementPortMemoire(new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => useCaseConsultation.executer({
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idEcole: 'ecole-1',
      idUtilisateur: 'user-1',
    }),
    /PERMISSION_REFUSED/i,
  );

  const depotClassement: DepotClassementColonneClasse = {
    async sauvegarder() {},
    async trouverParClasseEtColonne() { return creerClassement(); },
    async listerParClasse() { return []; },
    async supprimerLogiquementAncienClassement() {},
  };
  const depotResultat: DepotResultatBulletinEleve = {
    async sauvegarder() {},
    async trouverParId() { return creerResultatBulletin(); },
    async trouverParEleveEtAnnee() { return creerResultatBulletin(); },
    async trouverParEleveInscription() { return creerResultatBulletin(); },
    async listerParClasse() { return [creerResultatBulletin()]; },
    async listerNonClassesParClasseEtColonne() { return []; },
    async ajouterHistoriqueEncodageConduite() {},
    async listerHistoriqueEncodageConduite() { return []; },
    async ajouterSnapshotResultat(_snapshot: SnapshotResultatBulletin) {},
    async listerSnapshotsResultats() { return []; },
  };
  const useCaseRecalcul = new RecalculerClassementClasseUseCase(
    depotClassement,
    depotResultat,
    new TransactionManagerMemoire(),
    new AutorisationClassementPortMemoire(undefined, new Error('PERMISSION_REFUSED')),
  );

  await assert.rejects(
    () => useCaseRecalcul.executer({
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
      idEcole: 'ecole-1',
      idUtilisateur: 'user-1',
    }),
    /PERMISSION_REFUSED/i,
  );
});
