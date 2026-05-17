import type { BulletinEleve } from '../../domain/aggregates/BulletinEleve';
import type { BulletinEleveOutput } from '../dto/output/BulletinEleveOutput';

// Ce mapper convertit un bulletin de domaine en DTO de sortie.
export class BulletinMapper {
  // Cette methode produit un bulletin complet exploitable par l'application.
  public versSortie(bulletin: BulletinEleve): BulletinEleveOutput {
    return {
      idBulletinEleve: bulletin.obtenirId(),
      idEleve: (bulletin as unknown as { idEleve: string }).idEleve,
      idInscriptionScolaire: (bulletin as unknown as { idInscriptionScolaire: string }).idInscriptionScolaire,
      idClassePedagogique: (bulletin as unknown as { idClassePedagogique: string }).idClassePedagogique,
      idAnneeScolaire: (bulletin as unknown as { idAnneeScolaire: string }).idAnneeScolaire,
      etatBulletin: bulletin.obtenirEtatBulletin(),
      versionBulletin: bulletin.obtenirVersionBulletin(),
      lignes: bulletin.obtenirLignesBulletin().map((ligne) => ({
        idReferentielCours: ligne.obtenirIdReferentielCours(),
        libelleCours: ligne.obtenirLibelleCours(),
        ordreAffichage: ligne.obtenirOrdreAffichage(),
        estCalculable: ligne.obtenirEstCalculable(),
        aExamen: ligne.obtenirAExamen(),
        cotesColonnes: ligne.obtenirCotesColonnes(),
        totauxColonnes: ligne.obtenirTotauxColonnes(),
        stylesColonnes: ligne.obtenirStylesColonnes(),
      })),
      blocsApplicationConduite: bulletin.obtenirBlocsApplicationConduite().map((bloc) => ({
        codePeriode: bloc.obtenirCodePeriode(),
        application: bloc.obtenirApplication(),
        conduite: bloc.obtenirConduite(),
        pointsConduite: bloc.obtenirPointsConduite(),
      })),
    };
  }
}
