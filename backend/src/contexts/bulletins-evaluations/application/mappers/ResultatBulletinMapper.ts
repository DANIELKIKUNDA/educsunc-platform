import type { ResultatBulletinEleve } from '../../domain/aggregates/ResultatBulletinEleve';
import type { ResultatBulletinOutput } from '../dto/output/ResultatBulletinOutput';

// Ce mapper convertit un resultat consolide de domaine en DTO de sortie.
export class ResultatBulletinMapper {
  // Cette methode produit le DTO de lecture du resultat consolide.
  public versSortie(resultat: ResultatBulletinEleve): ResultatBulletinOutput {
    return {
      idResultatBulletinEleve: resultat.obtenirId(),
      idEleve: resultat.obtenirIdEleve(),
      idInscriptionScolaire: resultat.obtenirIdInscriptionScolaire(),
      resultatsColonnes: resultat.obtenirResultatsColonnes().map((colonne) => ({
        codeColonne: colonne.obtenirCodeColonne(),
        totalObtenu: colonne.obtenirTotalObtenu(),
        maximumGeneral: colonne.obtenirMaximumGeneral(),
        pourcentage: colonne.obtenirPourcentage(),
        rang: colonne.obtenirRang(),
        estClassable: colonne.obtenirEstClassable(),
        estNonClasse: colonne.obtenirEstNonClasse(),
      })),
      applications: [
        ...resultat.obtenirApplicationsPeriodes().map((application) => ({
          codePeriode: application.obtenirCodePeriode(),
          application: application.obtenirMentionApplication(),
        })),
        ...resultat.obtenirConduitesPeriodes().map((conduite) => ({
          codePeriode: conduite.obtenirCodePeriode(),
          conduite: conduite.obtenirMentionConduite(),
          pointsConduite: conduite.obtenirPointsConduite(),
        })),
      ],
      diagnostics: resultat.obtenirDiagnosticsEchec().map((diagnostic) => ({
        codeColonne: diagnostic.obtenirCodeColonne(),
        nombreEchecs: diagnostic.obtenirNombreEchecs(),
        nombreEchecsLegers: diagnostic.obtenirNombreEchecsLegers(),
        nombreEchecsProfonds: diagnostic.obtenirNombreEchecsProfonds(),
        eligiblePerequation: diagnostic.obtenirEligiblePerequation(),
        eligibleRepechage: diagnostic.obtenirEligibleRepechage(),
        commentaireTechnique: diagnostic.obtenirCommentaireTechnique(),
      })),
    };
  }
}
