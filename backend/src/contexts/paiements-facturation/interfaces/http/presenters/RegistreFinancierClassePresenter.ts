import type { RegistreFinancierClasseReadModel } from '../../../application/read-models/RegistreFinancierClasseReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class RegistreFinancierClassePresenter {
  public static presenterLecture(
    lecture: RegistreFinancierClasseReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idOrganisation: lecture.idOrganisation,
      idEcole: lecture.idEcole,
      idAnneeScolaire: lecture.idAnneeScolaire,
      idClassePedagogique: lecture.idClassePedagogique,
      moisAnalyseJusqua: lecture.moisAnalyseJusqua,
      colonnes: lecture.colonnes.map((colonne) => ({
        code: colonne.code,
        type: colonne.type,
        libelle: colonne.libelle,
        ordre: colonne.ordre,
        moisScolaire: colonne.moisScolaire,
        trancheFraisEtat: colonne.trancheFraisEtat,
        typeFrais: colonne.typeFrais,
      })),
      lignes: lecture.lignes.map((ligne) => ({
        numeroOrdre: ligne.numeroOrdre,
        idEleve: ligne.idEleve,
        matricule: ligne.matricule,
        nom: ligne.nom,
        postNom: ligne.postNom,
        prenom: ligne.prenom,
        sexe: ligne.sexe,
        dateInscription: ligne.dateInscription,
        statutScolaire: ligne.statutScolaire,
        cellules: ligne.cellules.map((cellule) => ({
          colonneCode: cellule.colonneCode,
          montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(cellule.montantAttendu),
          montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(cellule.montantPaye),
          montantExonere: PresentationHttpPaiementsFacturation.presenterMontant(cellule.montantExonere),
          resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(cellule.resteARecouvrer),
          estRedevable: cellule.estRedevable,
          estEnOrdre: cellule.estEnOrdre,
          statutAffiche: cellule.statutAffiche,
        })),
        situationFinanciere: {
          montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(
            ligne.situationFinanciere.montantAttendu,
          ),
          montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(
            ligne.situationFinanciere.montantPaye,
          ),
          montantExonere: PresentationHttpPaiementsFacturation.presenterMontant(
            ligne.situationFinanciere.montantExonere,
          ),
          resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(
            ligne.situationFinanciere.resteARecouvrer,
          ),
          estEnOrdre: ligne.situationFinanciere.estEnOrdre,
        },
      })),
      statistiquesParColonne: lecture.statistiquesParColonne.map((statistique) => ({
        colonneCode: statistique.colonneCode,
        elevesRedevables: statistique.elevesRedevables,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(statistique.montantAttendu),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(statistique.montantPaye),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(statistique.resteARecouvrer),
        elevesEnOrdre: statistique.elevesEnOrdre,
        elevesNonEnOrdre: statistique.elevesNonEnOrdre,
        tauxRecouvrement: statistique.tauxRecouvrement,
      })),
    });
  }
}
