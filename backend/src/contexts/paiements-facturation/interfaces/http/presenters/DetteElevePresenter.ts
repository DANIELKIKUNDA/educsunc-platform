import type {
  DetteAnnuelleOutput,
  DetteEleveOutput,
  LigneDetteOutput,
} from '../../../application/dto/output/DettesSortieDTO';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

// Ce fichier presente la dette consolidee d'un eleve pour les usages HTTP.
export class DetteElevePresenter {
  // Cette methode presente la dette globale d'un eleve.
  public static presenterDetteEleve(
    dette: DetteEleveOutput,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEleve: dette.idEleve,
      totalArrieres: PresentationHttpPaiementsFacturation.presenterMontant(dette.totalArrieres),
      totalAnneeActive: PresentationHttpPaiementsFacturation.presenterMontant(
        dette.totalAnneeActive,
      ),
      totalGlobal: PresentationHttpPaiementsFacturation.presenterMontant(dette.totalGlobal),
      dettesParAnnee: dette.dettesParAnnee.map((annee) => this.presenterAnnee(annee)),
    });
  }

  // Cette methode transforme une dette annuelle en structure JSON lisible.
  private static presenterAnnee(annee: DetteAnnuelleOutput): unknown {
    return {
      idAnneeScolaire: annee.idAnneeScolaire,
      statutAnnee: annee.statutAnnee,
      lignes: annee.lignes.map((ligne) => this.presenterLigne(ligne)),
      totalDu: PresentationHttpPaiementsFacturation.presenterMontant(annee.totalDu),
      totalPaye: PresentationHttpPaiementsFacturation.presenterMontant(annee.totalPaye),
      totalExonere: PresentationHttpPaiementsFacturation.presenterMontant(annee.totalExonere),
      soldeRestant: PresentationHttpPaiementsFacturation.presenterMontant(
        annee.soldeRestant,
      ),
    };
  }

  // Cette methode transforme une ligne de dette unitaire en JSON.
  private static presenterLigne(ligne: LigneDetteOutput): unknown {
    return {
      idObligation: ligne.idObligation,
      typeFrais: String(ligne.typeFrais),
      referenceFrais: ligne.referenceFrais,
      libelle: ligne.libelle,
      montantDuHistorique: PresentationHttpPaiementsFacturation.presenterMontant(
        ligne.montantDuHistorique,
      ),
      montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantPaye),
      montantExonere: PresentationHttpPaiementsFacturation.presenterMontant(
        ligne.montantExonere,
      ),
      solde: PresentationHttpPaiementsFacturation.presenterMontant(ligne.solde),
      statut: ligne.statut,
    };
  }
}
