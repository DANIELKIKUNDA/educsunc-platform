import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import type { HistoriqueBulletinReadModel } from 'contexts/bulletins-evaluations/application/read-models/HistoriqueBulletinReadModel';
import type { ApplicationConduiteOutput } from 'contexts/bulletins-evaluations/application/dto/output/ApplicationConduiteOutput';
import type { LigneBulletinOutput } from 'contexts/bulletins-evaluations/application/dto/output/LigneBulletinOutput';
import type { BulletinEleve } from 'contexts/bulletins-evaluations/domain/aggregates/BulletinEleve';
import type { BlocApplicationConduite } from 'contexts/bulletins-evaluations/domain/entities/BlocApplicationConduite';
import type { HistoriqueGenerationBulletin } from 'contexts/bulletins-evaluations/domain/entities/HistoriqueGenerationBulletin';
import type { LigneBulletinEleve } from 'contexts/bulletins-evaluations/domain/entities/LigneBulletinEleve';

// Ce fichier centralise le mapping PostgreSQL des bulletins et de leur historique.
export class BulletinPostgresMapper {
  // Cette methode transforme une ligne de bulletin domaine en ligne de lecture.
  public static versLigne(ligne: LigneBulletinEleve): LigneBulletinOutput {
    return {
      idReferentielCours: ligne.obtenirIdReferentielCours(),
      libelleCours: ligne.obtenirLibelleCours(),
      ordreAffichage: ligne.obtenirOrdreAffichage(),
      estCalculable: ligne.obtenirEstCalculable(),
      aExamen: ligne.obtenirAExamen(),
      cotesColonnes: ligne.obtenirCotesColonnes(),
      totauxColonnes: ligne.obtenirTotauxColonnes(),
      stylesColonnes: ligne.obtenirStylesColonnes(),
    };
  }

  // Cette methode transforme un bloc application/conduite domaine en bloc de lecture.
  public static versBloc(bloc: BlocApplicationConduite): ApplicationConduiteOutput {
    return {
      codePeriode: bloc.obtenirCodePeriode(),
      application: bloc.obtenirApplication(),
      conduite: bloc.obtenirConduite(),
      pointsConduite: bloc.obtenirPointsConduite(),
    };
  }

  // Cette methode transforme un historique de generation domaine en read model stable.
  public static versHistorique(historique: HistoriqueGenerationBulletin): HistoriqueBulletinReadModel {
    return {
      dateGeneration: historique.obtenirDateGeneration(),
      generePar: historique.obtenirGenerePar(),
      motifGeneration: historique.obtenirMotifGeneration(),
      versionBulletin: historique.obtenirVersionBulletin(),
      versionReferentielProgramme: historique.obtenirVersionReferentielProgramme(),
    };
  }

  // Cette methode transforme l'agregat bulletin en read model complet.
  public static versReadModel(bulletin: BulletinEleve): BulletinEleveReadModel {
    return {
      idBulletinEleve: bulletin.obtenirId(),
      idEleve: String(Reflect.get(bulletin, 'idEleve') ?? ''),
      idInscriptionScolaire: String(Reflect.get(bulletin, 'idInscriptionScolaire') ?? ''),
      idClassePedagogique: String(Reflect.get(bulletin, 'idClassePedagogique') ?? ''),
      idAnneeScolaire: String(Reflect.get(bulletin, 'idAnneeScolaire') ?? ''),
      etatBulletin: bulletin.obtenirEtatBulletin(),
      versionBulletin: bulletin.obtenirVersionBulletin(),
      lignes: bulletin.obtenirLignesBulletin().map((ligne) => this.versLigne(ligne)),
      blocsApplicationConduite: bulletin.obtenirBlocsApplicationConduite().map((bloc) => this.versBloc(bloc)),
    };
  }
}
