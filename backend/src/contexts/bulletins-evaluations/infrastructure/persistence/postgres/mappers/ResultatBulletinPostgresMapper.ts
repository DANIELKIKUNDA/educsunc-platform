import type { ResultatBulletinOutput } from 'contexts/bulletins-evaluations/application/dto/output/ResultatBulletinOutput';
import type { ApplicationConduiteOutput } from 'contexts/bulletins-evaluations/application/dto/output/ApplicationConduiteOutput';
import type { DiagnosticEchecOutput } from 'contexts/bulletins-evaluations/application/dto/output/DiagnosticEchecOutput';
import type { DiagnosticEchecReadModel } from 'contexts/bulletins-evaluations/application/read-models/DiagnosticEchecReadModel';
import type { ResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/ResultatBulletinEleve';
import type { ApplicationPeriode } from 'contexts/bulletins-evaluations/domain/entities/ApplicationPeriode';
import type { ConduitePeriode } from 'contexts/bulletins-evaluations/domain/entities/ConduitePeriode';
import type { DiagnosticEchec } from 'contexts/bulletins-evaluations/domain/entities/DiagnosticEchec';
import type { ResultatColonneBulletin } from 'contexts/bulletins-evaluations/domain/entities/ResultatColonneBulletin';

// Ce fichier centralise le mapping PostgreSQL des resultats consolides d'un eleve.
export class ResultatBulletinPostgresMapper {
  // Cette methode fusionne application et conduite par periode pour une lecture stable.
  public static versApplicationsConduites(
    applications: ApplicationPeriode[],
    conduites: ConduitePeriode[],
  ): ApplicationConduiteOutput[] {
    const resultat = new Map<string, ApplicationConduiteOutput>();

    for (const application of applications) {
      const cle = String(application.obtenirCodePeriode());
      resultat.set(cle, {
        codePeriode: application.obtenirCodePeriode(),
        application: application.obtenirMentionApplication(),
      });
    }

    for (const conduite of conduites) {
      const cle = String(conduite.obtenirCodePeriode());
      const courant = resultat.get(cle) ?? { codePeriode: conduite.obtenirCodePeriode() };
      courant.conduite = conduite.obtenirMentionConduite();
      courant.pointsConduite = conduite.obtenirPointsConduite();
      resultat.set(cle, courant);
    }

    return [...resultat.values()];
  }

  // Cette methode transforme un diagnostic domaine en DTO/read model de lecture.
  public static versDiagnostic(diagnostic: DiagnosticEchec): DiagnosticEchecOutput | DiagnosticEchecReadModel {
    return {
      codeColonne: diagnostic.obtenirCodeColonne(),
      nombreEchecs: diagnostic.obtenirNombreEchecs(),
      nombreEchecsLegers: diagnostic.obtenirNombreEchecsLegers(),
      nombreEchecsProfonds: diagnostic.obtenirNombreEchecsProfonds(),
      eligiblePerequation: diagnostic.obtenirEligiblePerequation(),
      eligibleRepechage: diagnostic.obtenirEligibleRepechage(),
      commentaireTechnique: diagnostic.obtenirCommentaireTechnique(),
    };
  }

  // Cette methode transforme un resultat de colonne domaine en bloc de sortie applicative.
  public static versColonne(colonne: ResultatColonneBulletin): ResultatBulletinOutput['resultatsColonnes'][number] {
    return {
      codeColonne: colonne.obtenirCodeColonne(),
      totalObtenu: colonne.obtenirTotalObtenu(),
      maximumGeneral: colonne.obtenirMaximumGeneral(),
      pourcentage: colonne.obtenirPourcentage(),
      rang: colonne.obtenirRang(),
      estClassable: colonne.obtenirEstClassable(),
      estNonClasse: colonne.obtenirEstNonClasse(),
    };
  }

  // Cette methode transforme l'agregat de resultat consolide en DTO de lecture.
  public static versOutput(resultat: ResultatBulletinEleve): ResultatBulletinOutput {
    return {
      idResultatBulletinEleve: resultat.obtenirId(),
      idEleve: resultat.obtenirIdEleve(),
      idInscriptionScolaire: resultat.obtenirIdInscriptionScolaire(),
      resultatsColonnes: resultat.obtenirResultatsColonnes().map((colonne) => this.versColonne(colonne)),
      applications: this.versApplicationsConduites(
        resultat.obtenirApplicationsPeriodes(),
        resultat.obtenirConduitesPeriodes(),
      ),
      diagnostics: resultat.obtenirDiagnosticsEchec().map((diagnostic) => this.versDiagnostic(diagnostic)),
    };
  }
}
