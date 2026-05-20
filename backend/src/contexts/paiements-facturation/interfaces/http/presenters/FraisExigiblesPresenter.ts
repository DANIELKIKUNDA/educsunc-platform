import type {
  FraisDisponibleOutput,
  FraisExigiblesEleveOutput,
} from '../../../application/dto/output/DettesSortieDTO';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

// Ce fichier presente les frais actuellement exigibles d'un eleve.
export class FraisExigiblesPresenter {
  // Cette methode presente la liste des frais que l'utilisateur peut reglementer.
  public static presenterFraisExigibles(
    sortie: FraisExigiblesEleveOutput,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEleve: sortie.idEleve,
      fraisDisponibles: sortie.fraisDisponibles.map((frais) => this.presenterFrais(frais)),
    });
  }

  // Cette methode transforme un frais disponible en JSON stable.
  private static presenterFrais(frais: FraisDisponibleOutput): unknown {
    return {
      typeFrais: String(frais.typeFrais),
      libelle: frais.libelle,
      montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(
        frais.montantAttendu,
      ),
      paiementPartielAutorise: frais.paiementPartielAutorise,
      resteAPayer: PresentationHttpPaiementsFacturation.presenterMontant(frais.resteAPayer),
    };
  }
}
