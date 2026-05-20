import type { RestitutionOutput } from '../../../application/dto/output/PaiementsSortieDTO';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

// Ce fichier presente les restitutions d'excedent dans le format HTTP du BC.
export class RestitutionPresenter {
  // Cette methode presente une restitution unique.
  public static presenterRestitution(
    restitution: RestitutionOutput,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idRestitution: restitution.idRestitution,
      montant: PresentationHttpPaiementsFacturation.presenterMontant(restitution.montant),
      raison: restitution.raison,
    });
  }
}
