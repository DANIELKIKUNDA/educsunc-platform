import type { RapportFinancierReadModel } from '../../../application/read-models/RapportFinancierReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class RapportFinancierPresenter {
  public static presenterRapport(
    rapport: RapportFinancierReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      periode: rapport.periode,
      totalEncaisse: PresentationHttpPaiementsFacturation.presenterMontant(
        rapport.totalEncaisse,
      ),
      totalConsomme: PresentationHttpPaiementsFacturation.presenterMontant(
        rapport.totalConsomme,
      ),
      totalAnticipe: PresentationHttpPaiementsFacturation.presenterMontant(
        rapport.totalAnticipe,
      ),
      totalRestitue: PresentationHttpPaiementsFacturation.presenterMontant(
        rapport.totalRestitue,
      ),
      totalAnnule: PresentationHttpPaiementsFacturation.presenterMontant(
        rapport.totalAnnule,
      ),
    });
  }
}
