import type { ArrieresEleveReadModel } from '../../../application/read-models/ArrieresEleveReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class ArrieresElevePresenter {
  public static presenterArrieres(
    arrieres: ArrieresEleveReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEleve: arrieres.idEleve,
      totalArrieres: PresentationHttpPaiementsFacturation.presenterMontant(
        arrieres.totalArrieres,
      ),
    });
  }
}
